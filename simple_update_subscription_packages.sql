-- Simple approach: Update existing subscription_packages with sequential IDs
-- This preserves the existing table structure and just changes the ID values

-- First, clear the existing data
DELETE FROM "public"."subscription_packages";

-- Reset the sequence if it exists
ALTER TABLE "public"."subscription_packages" ALTER COLUMN "id" RESTART WITH 1;

-- Insert the data with new sequential IDs
-- Business plan gets ID 1
INSERT INTO "public"."subscription_packages" ("id", "name", "price", "billing_cycle", "features", "status", "created_at", "updated_at") 
VALUES (1, 'Business', '99.99', 'monthly', '{"Storage: 500 GB – multi-TB","Users / Connections: Unlimited or high concurrency","Performance: High performance, SLA-backed uptime","Backup & Recovery: Continuous backups, disaster recovery","Security & Compliance: Advanced encryption, compliance with GDPR/HIPAA/SOC2","Support: 24/7 dedicated support, priority response","Integrations: Full integrations, analytics tools, custom connectors","Use Case: Large enterprises, mission-critical apps"}', 'active', '2025-08-16 21:09:56.154+00', '2025-08-16 21:09:56.154+00');

-- Free plan gets ID 2  
INSERT INTO "public"."subscription_packages" ("id", "name", "price", "billing_cycle", "features", "status", "created_at", "updated_at") 
VALUES (2, 'Free', '0.00', 'monthly', '{"Storage: 1–5 GB","Users / Connections: Limited (1–5 users)","Performance: Basic, suitable for small apps or testing","Backup & Recovery: Manual backups only","Support: Community support / forums","Integrations: Basic API access","Use Case: Personal projects, prototypes, small apps"}', 'active', '2025-08-16 21:08:39.703+00', '2025-08-16 21:08:39.703+00');

-- Pro plan gets ID 3
INSERT INTO "public"."subscription_packages" ("id", "name", "price", "billing_cycle", "features", "status", "created_at", "updated_at") 
VALUES (3, 'Pro', '29.99', 'monthly', '{"Storage: 50–200 GB","Users / Connections: Moderate (10–50 users)","Performance: Optimized for production apps","Backup & Recovery: Automated daily backups, point-in-time recovery","Security: Data encryption at rest and in transit, role-based access control","Support: Email and chat support, faster response times","Integrations: Full API access, BI/ETL integration","Use Case: Small to medium businesses, production apps"}', 'active', '2025-08-16 21:09:35.134+00', '2025-08-16 21:09:35.134+00');
