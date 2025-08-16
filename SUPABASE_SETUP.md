# Supabase Setup for Mirror Web

This guide explains how to set up the Supabase backend for the Mirror Web application, including authentication and profile management.

## Prerequisites

- A Supabase account
- Access to the Supabase project dashboard

## Setup Steps

### 1. Authentication Setup

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "Settings"
3. Configure the following settings:
   - Site URL: Set to your production URL (or http://localhost:3000 for development)
   - Enable Email provider
   - Configure OAuth providers (Google, Facebook, LinkedIn) if needed

### 2. Database Setup

#### Creating the Profile Table

1. Go to the "SQL Editor" in your Supabase dashboard
2. Create a new query
3. Copy and paste the SQL from `create_profile_table.sql` 
4. Run the query to create the profiles table with the following schema:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  website TEXT,
  company TEXT,
  job_title TEXT,
  bio TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Setting Up Row Level Security (RLS)

The SQL script includes RLS policies that:
1. Allow users to view their own profile
2. Allow users to update their own profile
3. Allow service role to manage all profiles

#### Creating the Profile Trigger

The SQL script also creates a trigger that automatically creates a profile when a new user signs up:

```sql
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();
```

### 3. Storage Setup

1. Go to "Storage" in your Supabase dashboard
2. Create a new bucket called "user-avatars"
3. Set the bucket's privacy setting to "Public"
4. Create RLS policies for the bucket:

```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read all avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'user-avatars');
```

## Client-Side Integration

The client-side integration is already set up in the following files:

- `supabase.js`: Core Supabase client initialization and authentication functions
- `profile.js`: Profile management functions
- `profile.html`: User profile page
- `sign-in.html` and `sign-up.html`: Authentication pages

## Testing the Setup

1. Create a new user through the sign-up page
2. Verify that a profile record is automatically created in the profiles table
3. Sign in with the new user
4. Navigate to the profile page and update your profile information
5. Verify that the changes are saved to the database

## Troubleshooting

### Common Issues

1. **Profile not created on sign-up**:
   - Check the trigger function in the SQL Editor
   - Verify that RLS policies are set correctly

2. **Cannot update profile**:
   - Check browser console for errors
   - Verify that RLS policies allow users to update their own profiles

3. **Avatar upload fails**:
   - Check storage bucket permissions
   - Verify that the bucket is public or has appropriate RLS policies

### Debugging

You can use the Supabase dashboard to:
1. View authentication logs
2. Inspect database tables
3. Monitor storage operations
4. Check API requests in the API tab

## Next Steps

Consider implementing:
1. Email verification
2. Password reset functionality
3. Two-factor authentication
4. Social login providers (Google, Facebook, etc.)
5. Subscription management with Stripe integration
