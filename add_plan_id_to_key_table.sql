-- Migration: Add plan_id column to Key table
-- This will link each key to a specific subscription plan

-- Step 1: Add the plan_id column
ALTER TABLE "public"."Key" 
ADD COLUMN "plan_id" INTEGER;

-- Step 2: Add a foreign key constraint to reference subscription_packages
ALTER TABLE "public"."Key" 
ADD CONSTRAINT "fk_key_plan_id" 
FOREIGN KEY ("plan_id") 
REFERENCES "public"."subscription_packages"("id");

-- Step 3: Update existing keys with appropriate plan IDs
-- You can customize these assignments based on your business logic
-- For example, if you want all existing keys to be Pro plan (ID 3):
UPDATE "public"."Key" 
SET "plan_id" = 3 
WHERE "plan_id" IS NULL;

-- Step 4: Make the plan_id column NOT NULL after updating existing data
ALTER TABLE "public"."Key" 
ALTER COLUMN "plan_id" SET NOT NULL;

-- Step 5: Verify the changes
SELECT 'Key table structure after adding plan_id:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'Key'
ORDER BY ordinal_position;

SELECT 'Sample data with plan_id:' as info;
SELECT k.*, sp.name as plan_name, sp.price as plan_price
FROM "public"."Key" k
LEFT JOIN "public"."subscription_packages" sp ON k.plan_id = sp.id
LIMIT 5;

-- Step 6: Show the foreign key constraint
SELECT 'Foreign key constraint created:' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'Key'
    AND kcu.column_name = 'plan_id';
