-- Insert 10 new 16-character alphanumeric keys into the Key table
INSERT INTO "Key" (key_value, used, created_at, updated_at) 
VALUES 
    ('A1B2C3D4E5F6G7H8', FALSE, NOW(), NOW()),
    ('B2C3D4E5F6G7H8I9', FALSE, NOW(), NOW()),
    ('C3D4E5F6G7H8I9J0', FALSE, NOW(), NOW()),
    ('D4E5F6G7H8I9J0K1', FALSE, NOW(), NOW()),
    ('E5F6G7H8I9J0K1L2', FALSE, NOW(), NOW()),
    ('F6G7H8I9J0K1L2M3', FALSE, NOW(), NOW()),
    ('G7H8I9J0K1L2M3N4', FALSE, NOW(), NOW()),
    ('H8I9J0K1L2M3N4O5', FALSE, NOW(), NOW()),
    ('I9J0K1L2M3N4O5P6', FALSE, NOW(), NOW()),
    ('J0K1L2M3N4O5P6Q7', FALSE, NOW(), NOW());

-- Verify the keys were inserted
SELECT 
    id,
    key_value,
    used,
    created_at,
    updated_at
FROM "Key" 
ORDER BY created_at DESC 
LIMIT 10;

-- Show total count of keys
SELECT COUNT(*) as total_keys FROM "Key";
