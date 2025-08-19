-- Fix: Add back the missing id column to Key table
-- This will restore the primary key functionality

-- Step 1: Add the id column back
ALTER TABLE "Key" ADD COLUMN id SERIAL PRIMARY KEY;

-- Step 2: Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN constraint_name IS NOT NULL THEN 'PRIMARY KEY'
        ELSE 'NOT PK'
    END as key_type
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu 
    ON c.table_name = kcu.table_name 
    AND c.column_name = kcu.column_name
WHERE c.table_name = 'Key' 
ORDER BY c.ordinal_position;

-- Step 3: Show sample data to confirm
SELECT * FROM "Key" LIMIT 3;

-- Step 4: Check if there are any unused keys
SELECT COUNT(*) as total_keys, 
       COUNT(CASE WHEN used = false THEN 1 END) as unused_keys,
       COUNT(CASE WHEN used = true THEN 1 END) as used_keys
FROM "Key";
