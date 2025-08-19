-- Create user_subscriptions table to fix 404 errors
-- This table tracks user subscription relationships

-- Create the user_subscriptions table
CREATE TABLE IF NOT EXISTS "user_subscriptions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES subscription_packages(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "user_subscriptions" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to read user_subscriptions" ON "user_subscriptions"
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert user_subscriptions" ON "user_subscriptions"
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update user_subscriptions" ON "user_subscriptions"
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete user_subscriptions" ON "user_subscriptions"
FOR DELETE TO authenticated
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON "user_subscriptions"(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_package_id ON "user_subscriptions"(package_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON "user_subscriptions"(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_user_subscriptions_updated_at_trigger
    BEFORE UPDATE ON "user_subscriptions"
    FOR EACH ROW
    EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- Insert some sample data (optional)
INSERT INTO "user_subscriptions" (user_id, package_id, status, start_date)
SELECT 
    p.id as user_id,
    sp.id as package_id,
    'active' as status,
    NOW() as start_date
FROM profiles p
CROSS JOIN subscription_packages sp
WHERE p.is_admin = false  -- Only for non-admin users
LIMIT 5;

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- Show sample data
SELECT 
    us.id,
    us.user_id,
    us.package_id,
    us.status,
    us.start_date,
    p.first_name,
    p.last_name,
    sp.name as package_name
FROM "user_subscriptions" us
JOIN profiles p ON us.user_id = p.id
JOIN subscription_packages sp ON us.package_id = sp.id
LIMIT 5;
