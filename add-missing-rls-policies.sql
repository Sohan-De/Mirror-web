-- Add missing RLS policies for key_delivery_logs table
-- This will fix the 403 Forbidden error when logging key deliveries

-- Policy 1: Allow authenticated users to INSERT logs
CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert key delivery logs" ON "key_delivery_logs"
FOR INSERT TO authenticated
WITH CHECK (true);

-- Policy 2: Allow authenticated users to READ logs  
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read key delivery logs" ON "key_delivery_logs"
FOR SELECT TO authenticated
USING (true);

-- Policy 3: Allow authenticated users to UPDATE logs
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update key delivery logs" ON "key_delivery_logs"
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Verify all policies were created
SELECT 
    tablename,
    policyname, 
    cmd, 
    permissive, 
    roles
FROM pg_policies 
WHERE tablename IN ('Key', 'key_delivery_logs')
ORDER BY tablename, cmd;

-- Check if key_delivery_logs table exists and has RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'key_delivery_logs';
