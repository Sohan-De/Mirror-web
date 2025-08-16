-- Add Email Column to Profiles Table
-- This script adds a new email column to store user emails directly in profiles

-- Step 1: Add the email column to the profiles table
ALTER TABLE profiles 
ADD COLUMN email TEXT;

-- Step 2: Update existing profiles with email data from auth.users
UPDATE profiles 
SET email = (
    SELECT u.email 
    FROM auth.users u 
    WHERE u.id = profiles.id
)
WHERE email IS NULL;

-- Step 3: Make the email column NOT NULL after populating it
ALTER TABLE profiles 
ALTER COLUMN email SET NOT NULL;

-- Step 4: Add an index on the email column for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Step 5: Update the trigger function to also save email
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
    first_name_val TEXT;
    last_name_val TEXT;
    full_name_val TEXT;
    email_val TEXT;
BEGIN
    -- Extract user information from auth.users table
    email_val := NEW.email;
    
    -- Try to extract first_name and last_name from user metadata
    -- Handle different possible metadata structures
    first_name_val := COALESCE(
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'firstName',
        ''
    );
    
    last_name_val := COALESCE(
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'lastName',
        ''
    );
    
    -- If no first/last name, try to extract from full_name
    full_name_val := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'fullName',
        ''
    );
    
    -- If we have full_name but no first/last, try to split it
    IF (first_name_val = '' AND last_name_val = '' AND full_name_val != '') THEN
        -- Simple name splitting (assumes "FirstName LastName" format)
        first_name_val := SPLIT_PART(full_name_val, ' ', 1);
        last_name_val := SPLIT_PART(full_name_val, ' ', 2);
    END IF;
    
    -- Insert profile with all available user information including email
    INSERT INTO public.profiles (
        id, 
        email,
        first_name, 
        last_name,
        created_at,
        updated_at,
        is_admin,
        subscription_tier,
        subscription_status
    ) VALUES (
        NEW.id, 
        email_val,
        first_name_val, 
        last_name_val,
        NOW(),
        NOW(),
        false, -- Default to non-admin
        'free', -- Default subscription tier
        'active' -- Default subscription status
    );
    
    -- Log what was saved for debugging
    RAISE NOTICE 'Profile created for user %: email=%, first_name=%, last_name=%', 
        NEW.id, email_val, first_name_val, last_name_val;
    
    RETURN NEW;
EXCEPTION
    -- Handle any errors gracefully
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        
        -- Try to create a minimal profile with just the ID and email
        BEGIN
            INSERT INTO public.profiles (
                id, 
                email,
                first_name, 
                last_name,
                created_at, 
                updated_at, 
                is_admin,
                subscription_tier,
                subscription_status
            ) VALUES (
                NEW.id, 
                email_val,
                '', 
                '',
                NOW(), 
                NOW(),
                false,
                'free',
                'active'
            );
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to create minimal profile for user %: %', NEW.id, SQLERRM;
        END;
        
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Update the existing profile update function to handle email
CREATE OR REPLACE FUNCTION update_existing_profiles_with_user_data()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    first_name_val TEXT;
    last_name_val TEXT;
    full_name_val TEXT;
    email_val TEXT;
BEGIN
    -- Loop through all existing profiles
    FOR user_record IN 
        SELECT p.id, u.email, u.raw_user_meta_data
        FROM profiles p
        JOIN auth.users u ON p.id = u.id
        WHERE p.first_name = '' OR p.last_name = '' OR p.email IS NULL
    LOOP
        -- Extract user information
        email_val := user_record.email;
        
        first_name_val := COALESCE(
            user_record.raw_user_meta_data->>'first_name',
            user_record.raw_user_meta_data->>'firstName',
            ''
        );
        
        last_name_val := COALESCE(
            user_record.raw_user_meta_data->>'last_name',
            user_record.raw_user_meta_data->>'lastName',
            ''
        );
        
        full_name_val := COALESCE(
            user_record.raw_user_meta_data->>'full_name',
            user_record.raw_user_meta_data->>'fullName',
            ''
        );
        
        -- If no first/last name, try to split full_name
        IF (first_name_val = '' AND last_name_val = '' AND full_name_val != '') THEN
            first_name_val := SPLIT_PART(full_name_val, ' ', 1);
            last_name_val := SPLIT_PART(full_name_val, ' ', 2);
        END IF;
        
        -- Update the profile with user information including email
        UPDATE profiles 
        SET 
            email = COALESCE(email_val, email),
            first_name = first_name_val,
            last_name = last_name_val,
            updated_at = NOW()
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Updated profile for user %: email=%, first_name=%, last_name=%', 
            user_record.id, email_val, first_name_val, last_name_val;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Update the manual profile function to handle email
CREATE OR REPLACE FUNCTION create_or_update_user_profile(
    user_email TEXT,
    first_name_val TEXT DEFAULT '',
    last_name_val TEXT DEFAULT '',
    is_admin_val BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
    existing_profile BOOLEAN;
BEGIN
    -- Get user ID from email
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO existing_profile;
    
    IF existing_profile THEN
        -- Update existing profile
        UPDATE profiles 
        SET 
            email = user_email,
            first_name = COALESCE(first_name_val, first_name),
            last_name = COALESCE(last_name_val, last_name),
            is_admin = COALESCE(is_admin_val, is_admin),
            updated_at = NOW()
        WHERE id = user_id;
        
        RAISE NOTICE 'Updated existing profile for user %', user_email;
    ELSE
        -- Create new profile
        INSERT INTO profiles (
            id, 
            email,
            first_name, 
            last_name,
            created_at, 
            updated_at,
            is_admin,
            subscription_tier,
            subscription_status
        ) VALUES (
            user_id, 
            user_email,
            first_name_val, 
            last_name_val,
            NOW(), 
            NOW(),
            is_admin_val,
            'free',
            'active'
        );
        
        RAISE NOTICE 'Created new profile for user %', user_email;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Show the updated table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 9: Show current profile status with email
SELECT 
    'Profiles with email column added successfully' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as profiles_with_email,
    COUNT(CASE WHEN first_name != '' OR last_name != '' THEN 1 END) as profiles_with_names,
    COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_profiles
FROM profiles;

-- Step 10: Show sample of updated profiles
SELECT 
    'Sample updated profiles' as info,
    id,
    email,
    first_name,
    last_name,
    is_admin,
    created_at,
    updated_at
FROM profiles 
ORDER BY updated_at DESC 
LIMIT 5;
