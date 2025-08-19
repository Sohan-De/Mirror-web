-- Fixed Migration: Convert subscription_packages from UUID to sequential integer IDs
-- This script handles existing data and constraints properly

-- Step 1: Check current table structure and data
-- First, let's see what we're working with
SELECT 'Current table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'subscription_packages'
ORDER BY ordinal_position;

SELECT 'Current data:' as info;
SELECT * FROM "public"."subscription_packages";

-- Step 2: Drop the existing primary key constraint
ALTER TABLE "public"."subscription_packages" DROP CONSTRAINT IF EXISTS "subscription_packages_pkey";

-- Step 3: Change the id column type to SERIAL
-- First, add a new SERIAL column
ALTER TABLE "public"."subscription_packages" ADD COLUMN "new_id" SERIAL;

-- Step 4: Copy data to the new column (this will auto-assign 1, 2, 3...)
-- The SERIAL column will automatically assign sequential numbers

-- Step 5: Drop the old id column and rename the new one
ALTER TABLE "public"."subscription_packages" DROP COLUMN "id";
ALTER TABLE "public"."subscription_packages" RENAME COLUMN "new_id" TO "id";

-- Step 6: Make the new id column the primary key
ALTER TABLE "public"."subscription_packages" ADD PRIMARY KEY ("id");

-- Step 7: Verify the new structure
SELECT 'New table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'subscription_packages'
ORDER BY ordinal_position;

SELECT 'New data with sequential IDs:' as info;
SELECT * FROM "public"."subscription_packages";

-- Step 8: Reset the sequence to start from 4 for future insertions
SELECT setval(pg_get_serial_sequence('"public"."subscription_packages"', 'id'), 4, false);
