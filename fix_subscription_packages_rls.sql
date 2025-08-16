-- Fix RLS policies for subscription_packages table
-- This script will create proper RLS policies to allow admin users to manage subscription packages

-- First, let's check if the table exists and create it if needed
CREATE TABLE IF NOT EXISTS subscription_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly',
    features TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the table
ALTER TABLE subscription_packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON subscription_packages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON subscription_packages;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON subscription_packages;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON subscription_packages;
DROP POLICY IF EXISTS "Enable all access for admin users" ON subscription_packages;

-- Create policies for subscription packages

-- Policy 1: Allow all users to read subscription packages (for pricing display)
CREATE POLICY "Enable read access for all users" ON subscription_packages
    FOR SELECT USING (true);

-- Policy 2: Allow authenticated users to insert new packages
CREATE POLICY "Enable insert for authenticated users" ON subscription_packages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to update packages
CREATE POLICY "Enable update for authenticated users" ON subscription_packages
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete packages
CREATE POLICY "Enable delete for authenticated users" ON subscription_packages
    FOR DELETE USING (auth.role() = 'authenticated');

-- Alternative: More restrictive policy that only allows admin users
-- Uncomment the following if you want only admin users to manage packages

/*
-- Drop the above policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON subscription_packages;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON subscription_packages;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON subscription_packages;

-- Create admin-only policies
CREATE POLICY "Enable insert for admin users" ON subscription_packages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Enable update for admin users" ON subscription_packages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Enable delete for admin users" ON subscription_packages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );
*/

-- Insert some default subscription packages if the table is empty
INSERT INTO subscription_packages (id, name, price, billing_cycle, features, status)
SELECT 
    'free-plan'::UUID,
    'Free',
    0.00,
    'na',
    ARRAY['Basic screen sharing', 'Up to 3 devices', '720p resolution'],
    'active'
WHERE NOT EXISTS (SELECT 1 FROM subscription_packages WHERE name = 'Free');

INSERT INTO subscription_packages (id, name, price, billing_cycle, features, status)
SELECT 
    'pro-plan'::UUID,
    'Pro',
    9.99,
    'monthly',
    ARRAY['Advanced screen sharing', 'Up to 10 devices', '1080p resolution', 'Recording feature'],
    'active'
WHERE NOT EXISTS (SELECT 1 FROM subscription_packages WHERE name = 'Pro');

INSERT INTO subscription_packages (id, name, price, billing_cycle, features, status)
SELECT 
    'business-plan'::UUID,
    'Business',
    29.99,
    'monthly',
    ARRAY['Premium screen sharing', 'Unlimited devices', '4K resolution', 'Recording & editing features', 'Priority support'],
    'active'
WHERE NOT EXISTS (SELECT 1 FROM subscription_packages WHERE name = 'Business');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_subscription_packages_updated_at_trigger ON subscription_packages;
CREATE TRIGGER update_subscription_packages_updated_at_trigger
    BEFORE UPDATE ON subscription_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_packages_updated_at();

-- Grant necessary permissions
GRANT ALL ON subscription_packages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Show the current policies
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
