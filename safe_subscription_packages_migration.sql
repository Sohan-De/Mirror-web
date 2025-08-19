-- Safe Migration: Convert subscription_packages from UUID to sequential integer IDs
-- This approach creates a new table and swaps it, preserving all data

-- Step 1: Create a new table with the desired structure
CREATE TABLE "public"."subscription_packages_new" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "billing_cycle" VARCHAR NOT NULL,
    "features" JSONB,
    "status" VARCHAR DEFAULT 'active',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Copy existing data to the new table
-- The SERIAL column will automatically assign sequential IDs: 1, 2, 3...
INSERT INTO "public"."subscription_packages_new" ("name", "price", "billing_cycle", "features", "status", "created_at", "updated_at")
SELECT "name", "price", "billing_cycle", "features", "status", "created_at", "updated_at"
FROM "public"."subscription_packages"
ORDER BY "price" DESC; -- This ensures Business (highest price) gets ID 1

-- Step 3: Verify the new data
SELECT 'New table data with sequential IDs:' as info;
SELECT * FROM "public"."subscription_packages_new";

-- Step 4: Drop the old table and rename the new one
DROP TABLE "public"."subscription_packages";
ALTER TABLE "public"."subscription_packages_new" RENAME TO "subscription_packages";

-- Step 5: Reset the sequence to start from 4 for future insertions
SELECT setval(pg_get_serial_sequence('"public"."subscription_packages"', 'id'), 4, false);

-- Step 6: Final verification
SELECT 'Final table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'subscription_packages'
ORDER BY ordinal_position;

SELECT 'Final data:' as info;
SELECT * FROM "public"."subscription_packages";
