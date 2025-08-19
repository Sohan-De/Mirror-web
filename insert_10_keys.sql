-- Insert 10 new keys into the Key table
INSERT INTO "Key" (used, created_at, updated_at) 
VALUES 
    (FALSE, NOW(), NOW()),
    (FALSE, NOW(), NOW()),
    (FALSE, NOW(), NOW()),
    (FALSE, NOW(), NOW()),
    (FALSE, NOW(), NOW()),
    (FALSE, NOW(), NOW()),
    (FALSE, NOW(), NOW()),
    (FALSE, NOW(), NOW()),
    (FALSE, NOW(), NOW()),
    (FALSE, NOW(), NOW());

-- Verify the keys were inserted
SELECT 
    id,
    used,
    created_at,
    updated_at
FROM "Key" 
ORDER BY created_at DESC 
LIMIT 10;

-- Show total count of keys
SELECT COUNT(*) as total_keys FROM "Key";
