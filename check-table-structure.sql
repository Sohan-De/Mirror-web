-- Check the actual structure of the Key table
-- Run this in your Supabase SQL Editor to see what columns exist

-- Method 1: Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Key' 
ORDER BY ordinal_position;

-- Method 2: Check if table exists and see sample data
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'Key'
) as table_exists;

-- Method 3: Try to see actual data (if table exists)
SELECT * FROM "Key" LIMIT 5;

-- Method 4: Check all tables in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Method 5: Check if there are any keys available
SELECT COUNT(*) as total_keys FROM "Key";
SELECT COUNT(*) as unused_keys FROM "Key" WHERE used = false;
