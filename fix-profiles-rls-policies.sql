-- Fix RLS policies for profiles table to enable user deletion
-- This will fix the issue where admin users can't delete other users

-- Step 1: Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Step 2: Check existing policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 3: Drop existing policies if they're too restrictive
DROP POLICY IF EXISTS "Allow users to update own profile" ON "profiles";
DROP POLICY IF EXISTS "Allow users to read own profile" ON "profiles";
DROP POLICY IF EXISTS "Allow users to delete own profile" ON "profiles";

-- Step 4: Create new, more permissive policies for admin operations
-- Policy 1: Allow authenticated users to read all profiles
CREATE POLICY "Allow authenticated users to read profiles" ON "profiles"
FOR SELECT TO authenticated
USING (true);

-- Policy 2: Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON "profiles"
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to insert their own profile
CREATE POLICY "Allow users to insert own profile" ON "profiles"
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 4: Allow admin users to delete any profile (including their own)
CREATE POLICY "Allow admin users to delete profiles" ON "profiles"
FOR DELETE TO authenticated
USING (
    -- Allow if user is deleting their own profile
    auth.uid() = id
    OR 
    -- Allow if current user is an admin
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
    )
);

-- Policy 5: Allow admin users to update any profile
CREATE POLICY "Allow admin users to update profiles" ON "profiles"
FOR UPDATE TO authenticated
USING (
    -- Allow if user is updating their own profile
    auth.uid() = id
    OR 
    -- Allow if current user is an admin
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
    )
)
WITH CHECK (
    -- Allow if user is updating their own profile
    auth.uid() = id
    OR 
    -- Allow if current user is an admin
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
    )
);

-- Step 5: Verify all policies were created
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd;

-- Step 6: Test if admin can delete a user (run this manually)
-- First, let's see what users exist
SELECT 
    id,
    first_name,
    last_name,
    email,
    is_admin,
    created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 7: Check if current user is admin
SELECT 
    current_user as current_user,
    session_user as session_user;
