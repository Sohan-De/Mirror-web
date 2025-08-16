# Fix Profile Data Saving Issue

## Problem Identified
❌ **User names are not being saved** in profiles table
❌ **User emails are missing** from profiles
❌ **Profile data is incomplete** - only basic fields are populated
❌ **Trigger function is not extracting** user metadata properly

## Current Status
Looking at your `profiles_rows.sql`, the table shows:
- ✅ `id` - User ID is saved
- ✅ `is_admin` - Admin status is saved  
- ✅ `created_at` and `updated_at` - Timestamps are saved
- ❌ `first_name` and `last_name` - **EMPTY** (should contain user names)
- ❌ User email and other details are missing

## Root Cause
The trigger function `create_profile_for_user()` is not properly extracting user metadata from the `auth.users` table when creating profiles.

## Solution Steps

### Step 1: Apply the Profile Data Saving Fix
Run the SQL script `fix_profile_data_saving.sql` in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `fix_profile_data_saving.sql`
4. Click "Run" to execute the script

**What this script does:**
- Updates the trigger function to properly extract user names
- Creates functions to update existing profiles
- Handles different metadata formats (first_name, firstName, full_name)
- Provides manual profile update functions

### Step 2: Update Existing Profiles
Run the `update_existing_profiles.sql` script to fix your current profiles:

1. Copy and paste the contents of `update_existing_profiles.sql`
2. Click "Run" to execute the script

**What this script does:**
- Shows what user data is available in `auth.users`
- Updates existing profiles with user names and emails
- Displays the updated profile information

### Step 3: Test New User Signup
After applying the fixes:

1. **Sign up a new user** with first name and last name
2. **Check the profiles table** - should now show user names
3. **Verify the trigger function** is working correctly

## What Gets Fixed

### ✅ **Trigger Function Enhancement**
- **Before**: Only saved basic profile fields
- **After**: Extracts and saves user names, handles metadata properly

### ✅ **Existing Profile Updates**
- **Before**: Empty first_name and last_name fields
- **After**: Populated with actual user information

### ✅ **Metadata Handling**
- **Before**: Couldn't handle different metadata formats
- **After**: Supports multiple metadata formats (first_name, firstName, full_name)

### ✅ **Error Handling**
- **Before**: Failed silently when metadata extraction failed
- **After**: Graceful fallbacks and detailed logging

## Expected Results

After running the fix scripts:

1. **New user signups** will automatically save names and emails
2. **Existing profiles** will be updated with user information
3. **Admin functionality** will work properly with complete user data
4. **Profile pages** will display user names correctly

## Manual Profile Updates (If Needed)

If you need to manually update specific profiles:

```sql
-- Update a specific user's profile
UPDATE profiles 
SET 
    first_name = 'John',
    last_name = 'Doe',
    updated_at = NOW()
WHERE id = 'USER_ID_HERE';

-- Or use the helper function
SELECT create_or_update_user_profile(
    'user@example.com',  -- email
    'John',              -- first_name
    'Doe',               -- last_name
    false                -- is_admin
);
```

## Verification Steps

After applying the fixes:

1. **Check existing profiles** - should now show user names
2. **Sign up a new user** - should automatically save all information
3. **View profile pages** - should display complete user information
4. **Admin dashboard** - should show user names in user lists

## Troubleshooting

### Issue: User names still not saving
**Solution**: Check if the trigger function was updated successfully

### Issue: Existing profiles not updated
**Solution**: Run the `update_existing_profiles.sql` script manually

### Issue: Metadata format not recognized
**Solution**: The enhanced trigger function handles multiple formats

### Issue: Trigger function errors
**Solution**: Check Supabase logs for any SQL errors

## Files to Use

1. **`fix_profile_data_saving.sql`** - Main fix for the trigger function
2. **`update_existing_profiles.sql`** - Update existing profiles with user data
3. **`set_admin_user.sql`** - Grant admin privileges (already updated)

## Final Result

After applying these fixes:
- ✅ **User names will be saved** automatically during signup
- ✅ **Existing profiles will be updated** with user information
- ✅ **Admin functionality will work** with complete user data
- ✅ **Profile pages will display** user names correctly
- ✅ **Database will be consistent** with user information

---

**Note**: The fix addresses the root cause of the profile data saving issue. New users will automatically have complete profiles, and existing profiles will be updated with available user information.
