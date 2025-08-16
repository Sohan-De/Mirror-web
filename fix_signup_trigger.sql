-- Fix for signup trigger causing 500 Internal Server Error
-- This fixes the "Database error saving new user" issue

-- First, drop the problematic trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user();

-- Create a more robust profile creation function that handles metadata properly
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  first_name_val TEXT;
  last_name_val TEXT;
BEGIN
  -- Safely extract first_name and last_name from user metadata
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
  
  -- Insert profile with available data
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    first_name_val, 
    last_name_val,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  -- Handle any errors gracefully
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    
    -- Try to create a minimal profile with just the ID
    BEGIN
      INSERT INTO public.profiles (id, created_at, updated_at)
      VALUES (NEW.id, NOW(), NOW());
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create minimal profile for user %: %', NEW.id, SQLERRM;
    END;
    
    -- Return NEW to allow the user creation to continue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- Also create a function to safely create profiles for existing users
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find users without profiles
  FOR user_record IN 
    SELECT id FROM auth.users 
    WHERE id NOT IN (SELECT id FROM profiles)
  LOOP
    BEGIN
      INSERT INTO profiles (id, created_at, updated_at) 
      VALUES (user_record.id, NOW(), NOW());
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for existing user %: %', user_record.id, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the function to create profiles for any existing users
SELECT create_missing_profiles();

-- Ensure the profiles table has all necessary columns
DO $$
BEGIN
  -- Add is_admin column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
  
  -- Add subscription_tier column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
  END IF;
  
  -- Add subscription_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Update RLS policies to ensure they work correctly
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can do all operations" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Recreate the policies
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

-- Allow users to insert their own profile (for the trigger)
CREATE POLICY "Users can insert their own profile" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON profiles TO service_role;

-- Ensure the trigger function has the right permissions
ALTER FUNCTION create_profile_for_user() SECURITY DEFINER;
