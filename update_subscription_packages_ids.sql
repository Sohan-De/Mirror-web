-- Migration: Update subscription_packages table to use sequential integer IDs
-- This will replace UUIDs with simple numbers: 1, 2, 3...

-- Step 1: Add a new temporary column for the new sequential ID
ALTER TABLE "public"."subscription_packages" 
ADD COLUMN "new_id" SERIAL;

-- Step 2: Update the existing rows with sequential numbers
-- The SERIAL column will automatically assign 1, 2, 3...

-- Step 3: Drop the old UUID column and rename the new one
ALTER TABLE "public"."subscription_packages" 
DROP COLUMN "id";

ALTER TABLE "public"."subscription_packages" 
RENAME COLUMN "new_id" TO "id";

-- Step 4: Make the new ID column the primary key
ALTER TABLE "public"."subscription_packages" 
ADD PRIMARY KEY ("id");

-- Step 5: Insert the updated data with new sequential IDs
-- Business plan will get ID 1
INSERT INTO "public"."subscription_packages" ("id", "name", "price", "billing_cycle", "features", "status", "created_at", "updated_at") 
VALUES (1, 'Business', '99.99', 'monthly', '{"Storage: 500 GB – multi-TB","Users / Connections: Unlimited or high concurrency","Performance: High performance, SLA-backed uptime","Backup & Recovery: Continuous backups, disaster recovery","Security & Compliance: Advanced encryption, compliance with GDPR/HIPAA/SOC2","Support: 24/7 dedicated support, priority response","Integrations: Full integrations, analytics tools, custom connectors","Use Case: Large enterprises, mission-critical apps"}', 'active', '2025-08-16 21:09:56.154+00', '2025-08-16 21:09:56.154+00');

-- Free plan will get ID 2  
INSERT INTO "public"."subscription_packages" ("id", "name", "price", "billing_cycle", "features", "status", "created_at", "updated_at") 
VALUES (2, 'Free', '0.00', 'monthly', '{"Storage: 1–5 GB","Users / Connections: Limited (1–5 users)","Performance: Basic, suitable for small apps or testing","Backup & Recovery: Manual backups only","Support: Community support / forums","Integrations: Basic API access","Use Case: Personal projects, prototypes, small apps"}', 'active', '2025-08-16 21:08:39.703+00', '2025-08-16 21:08:39.703+00');

-- Pro plan will get ID 3
INSERT INTO "public"."subscription_packages" ("id", "name", "price", "billing_cycle", "features", "status", "created_at", "updated_at") 
VALUES (3, 'Pro', '29.99', 'monthly', '{"Storage: 50–200 GB","Users / Connections: Moderate (10–50 users)","Performance: Optimized for production apps","Backup & Recovery: Automated daily backups, point-in-time recovery","Security: Data encryption at rest and in transit, role-based access control","Support: Email and chat support, faster response times","Integrations: Full API access, BI/ETL integration","Use Case: Small to medium businesses, production apps"}', 'active', '2025-08-16 21:09:35.134+00', '2025-08-16 21:09:35.134+00');

-- Step 6: Reset the sequence to start from 4 for future insertions
SELECT setval(pg_get_serial_sequence('"public"."subscription_packages"', 'id'), 4, false);
