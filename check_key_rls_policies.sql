-- Check RLS policies on Key table
-- This will help identify if there are policies preventing deletion

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'Key';

-- Check all RLS policies on the Key table
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
WHERE tablename = 'Key';

-- Check if there are any restrictive policies
SELECT 
    p.policyname,
    p.cmd,
    p.qual,
    p.with_check
FROM pg_policies p
JOIN pg_class c ON p.tablename = c.relname
WHERE c.relname = 'Key' 
AND (p.cmd = 'DELETE' OR p.cmd = 'ALL');

-- Check current user and permissions
SELECT current_user, session_user;

-- Test if we can see the actual data
SELECT COUNT(*) as total_keys FROM "Key";
SELECT id, key_value, used FROM "Key" LIMIT 5;
