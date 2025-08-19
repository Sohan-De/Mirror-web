-- Check RLS policies that might be blocking key updates
-- This will help identify why keys are not being marked as used

-- Step 1: Check if RLS is enabled on the Key table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'Key';

-- Step 2: List all RLS policies on the Key table
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

-- Step 3: Check if there are any policies that might block UPDATE operations
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'UPDATE' THEN 'UPDATE policy'
        WHEN cmd = 'ALL' THEN 'ALL operations policy'
        ELSE 'Other policy'
    END as policy_type,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'Key' 
AND (cmd = 'UPDATE' OR cmd = 'ALL');

-- Step 4: Check current user and permissions
SELECT 
    current_user as current_user,
    session_user as session_user,
    current_setting('role') as current_role;

-- Step 5: Test if we can manually update a key (run this as a test)
-- First, let's see what keys exist
SELECT id, key_value, used, created_at, updated_at 
FROM "Key" 
WHERE used = false 
LIMIT 1;

-- Step 6: Check if there are any triggers that might interfere
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'Key';

-- Step 7: Check table structure and constraints
SELECT 
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN kcu.constraint_name IS NOT NULL THEN 'Has constraint'
        ELSE 'No constraint'
    END as constraint_status
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu 
    ON c.table_name = kcu.table_name 
    AND c.column_name = kcu.column_name
WHERE c.table_name = 'Key' 
ORDER BY c.ordinal_position;
