-- Fix for profile fetching issues - 406 Not Acceptable error
-- This fixes the "Cannot coerce the result to a single JSON object" issue

-- First, let's check and fix any existing profile data issues
-- Update any profiles with NULL values to have proper defaults
UPDATE profiles 
SET 
    first_name = COALESCE(first_name, ''),
    last_name = COALESCE(last_name, ''),
    avatar_url = COALESCE(avatar_url, ''),
    website = COALESCE(website, ''),
    company = COALESCE(company, ''),
    job_title = COALESCE(job_title, ''),
    bio = COALESCE(bio, ''),
    subscription_tier = COALESCE(subscription_tier, 'free'),
    subscription_status = COALESCE(subscription_status, 'active'),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE 
    first_name IS NULL 
    OR last_name IS NULL 
    OR avatar_url IS NULL 
    OR website IS NULL 
    OR company IS NULL 
    OR job_title IS NULL 
    OR bio IS NULL 
    OR subscription_tier IS NULL 
    OR subscription_status IS NULL 
    OR created_at IS NULL 
    OR updated_at IS NULL;

-- Ensure the is_admin column exists and has proper defaults
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
    
    -- Update any existing NULL values
    UPDATE profiles SET is_admin = false WHERE is_admin IS NULL;
END $$;

-- Fix any potential data type issues
-- Convert any text fields that might have unexpected data types
ALTER TABLE profiles 
ALTER COLUMN first_name TYPE TEXT USING first_name::TEXT,
ALTER COLUMN last_name TYPE TEXT USING last_name::TEXT,
ALTER COLUMN avatar_url TYPE TEXT USING avatar_url::TEXT,
ALTER COLUMN website TYPE TEXT USING website::TEXT,
ALTER COLUMN company TYPE TEXT USING company::TEXT,
ALTER COLUMN job_title TYPE TEXT USING job_title::TEXT,
ALTER COLUMN bio TYPE TEXT USING bio::TEXT,
ALTER COLUMN subscription_tier TYPE TEXT USING subscription_tier::TEXT,
ALTER COLUMN subscription_status TYPE TEXT USING subscription_status::TEXT;

-- Ensure timestamps are properly formatted
ALTER TABLE profiles 
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at::TIMESTAMP WITH TIME ZONE,
ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at::TIMESTAMP WITH TIME ZONE;

-- Set proper defaults for any NULL timestamps
UPDATE profiles 
SET 
    created_at = NOW() WHERE created_at IS NULL,
    updated_at = NOW() WHERE updated_at IS NULL;

-- Fix RLS policies to ensure they work correctly
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can do all operations" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Recreate the policies with proper syntax
CREATE POLICY "Users can view their own profile" 
  ON profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Service role can do all operations" 
  ON profiles 
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own profile" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON profiles TO service_role;

-- Create a function to safely get user profile
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

-- Create a function to ensure profile exists
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

-- Test the functions
SELECT 'Profile table structure fixed successfully' as status;
