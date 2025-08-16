-- Update Existing Profiles with User Information
-- This script will update your existing profiles with user names and other details

-- First, let's see what user data is available in auth.users
SELECT 
    'Current auth.users data' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN raw_user_meta_data->>'first_name' IS NOT NULL THEN 1 END) as users_with_first_name,
    COUNT(CASE WHEN raw_user_meta_data->>'last_name' IS NOT NULL THEN 1 END) as users_with_last_name,
    COUNT(CASE WHEN raw_user_meta_data->>'full_name' IS NOT NULL THEN 1 END) as users_with_full_name
FROM auth.users;

-- Show sample user metadata to understand the structure
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
LIMIT 5;

-- Now let's update existing profiles with user information
UPDATE profiles 
SET 
    first_name = COALESCE(
        (SELECT raw_user_meta_data->>'first_name' FROM auth.users WHERE id = profiles.id),
        (SELECT raw_user_meta_data->>'firstName' FROM auth.users WHERE id = profiles.id),
        ''
    ),
    last_name = COALESCE(
        (SELECT raw_user_meta_data->>'last_name' FROM auth.users WHERE id = profiles.id),
        (SELECT raw_user_meta_data->>'lastName' FROM auth.users WHERE id = profiles.id),
        ''
    ),
    updated_at = NOW()
WHERE id IN (
    SELECT p.id 
    FROM profiles p 
    JOIN auth.users u ON p.id = u.id 
    WHERE p.first_name = '' OR p.last_name = ''
);

-- Show the updated profiles
SELECT 
    'Updated profiles' as info,
    p.id,
    p.first_name,
    p.last_name,
    p.is_admin,
    u.email,
    p.created_at,
    p.updated_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.updated_at DESC;

-- If you want to manually set specific user information, use this:
-- Example: Update a specific user's profile
-- UPDATE profiles 
-- SET 
--     first_name = 'John',
--     last_name = 'Doe',
--     updated_at = NOW()
-- WHERE id = '63eaf8af-afb5-43ef-b177-ef9873b31ea2';

-- Show final status
SELECT 
    'Final profile status' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN first_name != '' OR last_name != '' THEN 1 END) as profiles_with_names,
    COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_profiles,
    COUNT(CASE WHEN first_name = '' AND last_name = '' THEN 1 END) as profiles_without_names
FROM profiles;
