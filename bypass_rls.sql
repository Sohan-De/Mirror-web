-- EMERGENCY FIX: Completely disable RLS temporarily to allow admin dashboard access
-- WARNING: This removes security restrictions temporarily. Re-enable RLS after debugging.

-- Disable RLS on the profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create a backup of existing policies (so we can restore them later)
CREATE TABLE IF NOT EXISTS policy_backup AS
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies 
WHERE 
    tablename = 'profiles';

-- After debugging is complete, you can re-enable RLS with:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
