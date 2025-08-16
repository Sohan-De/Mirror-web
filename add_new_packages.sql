-- Add new subscription packages to the subscription_packages table
-- This script will add 3 new packages: Free, Pro, and Business

-- First, let's check if the table exists and create it if it doesn't
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

-- Insert the 3 new subscription packages
INSERT INTO subscription_packages (name, price, billing_cycle, features, status)
VALUES 
    (
        'Free', 
        0, 
        'na', 
        '["Basic screen sharing", "Up to 3 devices", "720p resolution", "Standard support"]'::jsonb, 
        'active'
    ),
    (
        'Pro', 
        9.99, 
        'monthly', 
        '["Advanced screen sharing", "Up to 10 devices", "1080p resolution", "Recording feature", "Priority support", "Custom branding"]'::jsonb, 
        'active'
    ),
    (
        'Business', 
        29.99, 
        'monthly', 
        '["Premium screen sharing", "Unlimited devices", "4K resolution", "Recording & editing features", "Priority support", "Custom branding", "Analytics dashboard", "Team management"]'::jsonb, 
        'active'
    )
ON CONFLICT (name) DO UPDATE SET
    price = EXCLUDED.price,
    billing_cycle = EXCLUDED.billing_cycle,
    features = EXCLUDED.features,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Display the packages that were added
SELECT 
    name,
    price,
    billing_cycle,
    features,
    status,
    created_at
FROM subscription_packages 
WHERE name IN ('Free', 'Pro', 'Business')
ORDER BY price ASC;
