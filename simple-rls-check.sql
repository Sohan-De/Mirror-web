-- Simple RLS check for Key table
-- This will help identify why keys are not being marked as used

-- Step 1: Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'Key';

-- Step 2: List all policies on the Key table
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'Key';

-- Step 3: Check current user
SELECT 
    current_user as current_user,
    session_user as session_user;

-- Step 4: Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Key' 
ORDER BY ordinal_position;

-- Step 5: Check for unused keys
SELECT 
    id, 
    key_value, 
    used, 
    created_at, 
    updated_at 
FROM "Key" 
WHERE used = false 
LIMIT 3;

-- Step 6: Test manual update (run this to see if it works)
-- UPDATE "Key" 
-- SET used = true, updated_at = NOW() 
-- WHERE id = 1 
-- RETURNING *;
