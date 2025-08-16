-- Create subscription packages table
CREATE TABLE IF NOT EXISTS subscription_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL, -- 'monthly', 'yearly', 'one-time', 'na'
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'coming-soon'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE subscription_packages IS 'Subscription packages available to users';

-- Add comments to columns
COMMENT ON COLUMN subscription_packages.id IS 'Unique identifier for the subscription package';
COMMENT ON COLUMN subscription_packages.name IS 'Name of the subscription package (e.g., Free, Pro, Business)';
COMMENT ON COLUMN subscription_packages.price IS 'Price of the subscription package';
COMMENT ON COLUMN subscription_packages.billing_cycle IS 'Billing cycle of the subscription (monthly, yearly, one-time, na)';
COMMENT ON COLUMN subscription_packages.features IS 'Array of features included in the subscription package';
COMMENT ON COLUMN subscription_packages.status IS 'Status of the subscription package (active, inactive, coming-soon)';
COMMENT ON COLUMN subscription_packages.created_at IS 'Timestamp when the subscription package was created';
COMMENT ON COLUMN subscription_packages.updated_at IS 'Timestamp when the subscription package was last updated';

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_packages_updated_at
BEFORE UPDATE ON subscription_packages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription packages
INSERT INTO subscription_packages (name, price, billing_cycle, features, status)
VALUES 
    (
        'Free', 
        0, 
        'na', 
        '["Basic screen sharing", "Up to 3 devices", "720p resolution"]'::jsonb, 
        'active'
    ),
    (
        'Pro', 
        9.99, 
        'monthly', 
        '["Advanced screen sharing", "Up to 10 devices", "1080p resolution", "Recording feature"]'::jsonb, 
        'active'
    ),
    (
        'Business', 
        29.99, 
        'monthly', 
        '["Premium screen sharing", "Unlimited devices", "4K resolution", "Recording & editing features", "Priority support"]'::jsonb, 
        'active'
    );

-- Create user_subscriptions table to track which users have which subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES subscription_packages(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, package_id, status)
);

-- Add comment to table
COMMENT ON TABLE user_subscriptions IS 'Tracks which users have which subscription packages';

-- Add comments to columns
COMMENT ON COLUMN user_subscriptions.id IS 'Unique identifier for the user subscription';
COMMENT ON COLUMN user_subscriptions.user_id IS 'User ID from auth.users table';
COMMENT ON COLUMN user_subscriptions.package_id IS 'Subscription package ID';
COMMENT ON COLUMN user_subscriptions.status IS 'Status of the subscription (active, cancelled, expired, trial)';
COMMENT ON COLUMN user_subscriptions.start_date IS 'Start date of the subscription';
COMMENT ON COLUMN user_subscriptions.end_date IS 'End date of the subscription (null for active subscriptions)';
COMMENT ON COLUMN user_subscriptions.created_at IS 'Timestamp when the user subscription was created';
COMMENT ON COLUMN user_subscriptions.updated_at IS 'Timestamp when the user subscription was last updated';

-- Create trigger to update the updated_at timestamp for user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS TABLE (
    package_id UUID,
    package_name VARCHAR(255),
    package_price DECIMAL(10, 2),
    package_features JSONB,
    subscription_status VARCHAR(50),
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.id AS package_id,
        sp.name AS package_name,
        sp.price AS package_price,
        sp.features AS package_features,
        us.status AS subscription_status,
        us.start_date AS subscription_start_date,
        us.end_date AS subscription_end_date
    FROM 
        user_subscriptions us
    JOIN 
        subscription_packages sp ON us.package_id = sp.id
    WHERE 
        us.user_id = user_uuid
    AND 
        us.status = 'active'
    ORDER BY 
        us.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for subscription_packages table
ALTER TABLE subscription_packages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active subscription packages
CREATE POLICY "Anyone can view active subscription packages" 
ON subscription_packages 
FOR SELECT 
USING (status = 'active');

-- Allow admins to manage subscription packages
CREATE POLICY "Admins can manage subscription packages" 
ON subscription_packages 
USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create RLS policies for user_subscriptions table
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON user_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow admins to manage all user subscriptions
CREATE POLICY "Admins can manage all user subscriptions" 
ON user_subscriptions 
USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Update profiles table to include subscription_tier field if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE profiles ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
    END IF;
END $$;

-- Create function to automatically assign free subscription to new users
CREATE OR REPLACE FUNCTION assign_free_subscription()
RETURNS TRIGGER AS $$
DECLARE
    free_package_id UUID;
BEGIN
    -- Get the ID of the Free package
    SELECT id INTO free_package_id FROM subscription_packages WHERE name = 'Free' LIMIT 1;
    
    -- If Free package exists, assign it to the new user
    IF free_package_id IS NOT NULL THEN
        INSERT INTO user_subscriptions (user_id, package_id, status)
        VALUES (NEW.id, free_package_id, 'active');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to assign free subscription to new users
CREATE TRIGGER assign_free_subscription_to_new_users
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION assign_free_subscription();
