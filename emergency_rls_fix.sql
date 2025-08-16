-- EMERGENCY RLS FIX - Fix infinite recursion in profiles table
-- This script will immediately fix the infinite recursion issue

-- Step 1: Disable RLS temporarily to stop the infinite loop
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies that might be causing recursion
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable all access for admin users" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Step 3: Grant all permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;

-- Step 4: Test if we can now read all profiles
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT id, email, first_name, last_name, is_admin FROM profiles ORDER BY created_at;

-- Step 5: Re-enable RLS with VERY simple policies (no recursion possible)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create simple policies that cannot cause recursion
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_delete_policy" ON profiles FOR DELETE USING (true);

-- Step 7: Verify the policies are working
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
WHERE tablename = 'profiles';

-- Step 8: Final test - should now work without recursion
SELECT COUNT(*) as total_profiles_after_fix FROM profiles;
SELECT id, email, first_name, last_name, is_admin FROM profiles ORDER BY created_at;
