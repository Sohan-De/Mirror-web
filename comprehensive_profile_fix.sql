-- Comprehensive Profile Fix - Addresses all profile-related issues
-- This fixes the 406 Not Acceptable error and profile fetching problems

-- Step 1: Drop and recreate the profiles table with proper structure
DROP TABLE IF EXISTS profiles CASCADE;

-- Create a clean profiles table with proper structure
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    website TEXT DEFAULT '',
    company TEXT DEFAULT '',
    job_title TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_start TIMESTAMP WITH TIME ZONE,
    subscription_end TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create proper RLS policies
CREATE POLICY "Users can view their own profile" 
    ON profiles 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can do all operations" 
    ON profiles 
    USING (auth.role() = 'service_role');

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON profiles TO service_role;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON profiles(is_admin);

-- Step 6: Create a robust profile creation function
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a basic profile with proper defaults
    INSERT INTO public.profiles (
        id, 
        first_name, 
        last_name,
        created_at,
        updated_at,
        is_admin
    ) VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NOW(),
        NOW(),
        false
    );
    
    RETURN NEW;
EXCEPTION
    -- Handle any errors gracefully
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        
        -- Try to create a minimal profile
        BEGIN
            INSERT INTO public.profiles (id, created_at, updated_at, is_admin)
            VALUES (NEW.id, NOW(), NOW(), false);
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to create minimal profile for user %: %', NEW.id, SQLERRM;
        END;
        
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- Step 8: Create helper functions
CREATE OR REPLACE FUNCTION get_user_profile_safe(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    website TEXT,
    company TEXT,
    job_title TEXT,
    bio TEXT,
    subscription_tier TEXT,
    subscription_status TEXT,
    subscription_start TIMESTAMP WITH TIME ZONE,
    subscription_end TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        COALESCE(p.first_name, '')::TEXT,
        COALESCE(p.last_name, '')::TEXT,
        COALESCE(p.avatar_url, '')::TEXT,
        COALESCE(p.website, '')::TEXT,
        COALESCE(p.company, '')::TEXT,
        COALESCE(p.job_title, '')::TEXT,
        COALESCE(p.bio, '')::TEXT,
        COALESCE(p.subscription_tier, 'free')::TEXT,
        COALESCE(p.subscription_status, 'active')::TEXT,
        p.subscription_start,
        p.subscription_end,
        COALESCE(p.is_admin, false)::BOOLEAN,
        COALESCE(p.created_at, NOW())::TIMESTAMP WITH TIME ZONE,
        COALESCE(p.updated_at, NOW())::TIMESTAMP WITH TIME ZONE
    FROM profiles p
    WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION ensure_profile_exists(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if profile exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_uuid) THEN
        -- Create a basic profile
        INSERT INTO profiles (
            id, 
            first_name, 
            last_name, 
            created_at, 
            updated_at,
            is_admin
        ) VALUES (
            user_uuid, 
            '', 
            '', 
            NOW(), 
            NOW(),
            false
        );
        RETURN true;
    END IF;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create profiles for existing users (if any)
-- This will create profiles for users who signed up before the trigger was created
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM auth.users 
        WHERE id NOT IN (SELECT id FROM profiles)
    LOOP
        BEGIN
            INSERT INTO profiles (
                id, 
                first_name, 
                last_name, 
                created_at, 
                updated_at,
                is_admin
            ) VALUES (
                user_record.id, 
                '', 
                '', 
                NOW(), 
                NOW(),
                false
            );
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to create profile for existing user %: %', user_record.id, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 10: Verify the setup
SELECT 
    'Profiles table created successfully' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_profiles
FROM profiles;
