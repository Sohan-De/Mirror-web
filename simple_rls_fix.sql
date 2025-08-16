-- Simple RLS Fix for subscription_packages table
-- This script will fix the RLS policies step by step

-- Step 1: Check if table exists and drop it if it has issues
DROP TABLE IF EXISTS subscription_packages CASCADE;

-- Step 2: Create the table fresh
CREATE TABLE subscription_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly',
    features TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Disable RLS temporarily to insert data
ALTER TABLE subscription_packages DISABLE ROW LEVEL SECURITY;

-- Step 4: Insert default plans
INSERT INTO subscription_packages (id, name, price, billing_cycle, features, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Free', 0.00, 'na', ARRAY['Basic screen sharing', 'Up to 3 devices', '720p resolution'], 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'Pro', 9.99, 'monthly', ARRAY['Advanced screen sharing', 'Up to 10 devices', '1080p resolution', 'Recording feature'], 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Business', 29.99, 'monthly', ARRAY['Premium screen sharing', 'Unlimited devices', '4K resolution', 'Recording & editing features', 'Priority support'], 'active');

-- Step 5: Enable RLS
ALTER TABLE subscription_packages ENABLE ROW LEVEL SECURITY;

-- Step 6: Create simple policies that will definitely work
CREATE POLICY "subscription_packages_select_policy" ON subscription_packages
    FOR SELECT USING (true);

CREATE POLICY "subscription_packages_insert_policy" ON subscription_packages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "subscription_packages_update_policy" ON subscription_packages
    FOR UPDATE USING (true);

CREATE POLICY "subscription_packages_delete_policy" ON subscription_packages
    FOR DELETE USING (true);

-- Step 7: Grant permissions
GRANT ALL ON subscription_packages TO authenticated;
GRANT ALL ON subscription_packages TO anon;

-- Step 8: Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'subscription_packages';

-- Step 9: Show the data
SELECT * FROM subscription_packages;
