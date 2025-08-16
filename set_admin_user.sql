-- Set Admin User - Use this to grant admin privileges to a specific user
-- Replace 'USER_EMAIL_HERE' with the actual email address of the user you want to make admin

-- Option 1: Set admin by email (recommended)
UPDATE profiles 
SET is_admin = true 
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'Sohank.design@yahoo.com'
);

-- Option 2: Set admin by user ID (if you know the UUID)
-- UPDATE profiles 
-- SET is_admin = true 
-- WHERE id = 'USER_UUID_HERE';

-- Option 3: Check current admin users
SELECT 
    p.id,
    p.is_admin,
    u.email,
    p.first_name,
    p.last_name
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.is_admin = true;

-- Option 4: Check all users and their admin status
SELECT 
    p.id,
    p.is_admin,
    u.email,
    p.first_name,
    p.last_name,
    p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;
