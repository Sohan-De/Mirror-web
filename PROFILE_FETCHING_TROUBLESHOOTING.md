# Profile Fetching 406 Error - Troubleshooting Guide

## Problem Description
You're experiencing a 406 Not Acceptable error when trying to fetch user profiles, with the error message "Cannot coerce the result to a single JSON object".

## Root Cause
The 406 error typically occurs when:

1. **Data Type Mismatches**: The database contains data that can't be properly converted to JSON
2. **NULL Values**: Some profile fields contain NULL values that cause serialization issues
3. **Missing Columns**: The profiles table is missing expected columns
4. **RLS Policy Issues**: Row Level Security policies are blocking access
5. **Corrupted Data**: Profile data was created with incomplete or malformed information

## Solution Steps

### Step 1: Apply the Database Fix
Run the SQL script `fix_profile_fetching.sql` in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `fix_profile_fetching.sql`
4. Click "Run" to execute the script

This script will:
- Fix NULL values in existing profiles
- Ensure proper data types for all columns
- Fix RLS policies
- Create helper functions for safe profile access
- Grant necessary permissions

### Step 2: Update the JavaScript Code
The `profile.js` file has been updated with:

- **Enhanced error handling** for profile fetching
- **Fallback profile creation** if none exists
- **Data validation** to ensure all fields have proper values
- **Graceful degradation** when database access fails

### Step 3: Test the Fix
After applying both fixes:

1. Try to access a user profile page
2. Check the browser console for any remaining errors
3. Verify that profile data loads correctly
4. Test profile updates and creation

## Alternative Solutions

### Option 1: Manual Profile Creation
If the automatic fix doesn't work, manually create profiles:

```sql
-- Check existing profiles
SELECT * FROM profiles LIMIT 5;

-- Create a profile for a specific user (replace USER_ID)
INSERT INTO profiles (
    id, 
    first_name, 
    last_name, 
    created_at, 
    updated_at,
    is_admin
) VALUES (
    'USER_ID_HERE', 
    'Default', 
    'User', 
    NOW(), 
    NOW(),
    false
);
```

### Option 2: Reset Problematic Profiles
If specific profiles are causing issues:

```sql
-- Delete and recreate a problematic profile
DELETE FROM profiles WHERE id = 'PROBLEMATIC_USER_ID';

-- The trigger should recreate it, or you can manually insert
```

### Option 3: Use the Safe Function
Use the safe profile function created by the fix script:

```sql
-- Get profile using the safe function
SELECT * FROM get_user_profile_safe('USER_ID_HERE');
```

## Debugging Steps

### Check Database Structure
Verify the profiles table has the correct structure:

```sql
-- Check table structure
\d profiles

-- Check for NULL values
SELECT 
    COUNT(*) as total_profiles,
    COUNT(first_name) as profiles_with_first_name,
    COUNT(last_name) as profiles_with_last_name,
    COUNT(created_at) as profiles_with_created_at
FROM profiles;
```

### Check RLS Policies
Verify Row Level Security is working:

```sql
-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Test User Access
Test if a specific user can access their profile:

```sql
-- Test as authenticated user (replace with actual user ID)
SET request.jwt.claim.sub = 'USER_ID_HERE';
SELECT * FROM profiles WHERE id = 'USER_ID_HERE';
RESET request.jwt.claim.sub;
```

## Common Issues and Solutions

### Issue: "Column does not exist"
**Solution**: Run the `create_profile_table.sql` script first

### Issue: "Permission denied"
**Solution**: Check that RLS policies are correctly configured

### Issue: "Invalid input syntax"
**Solution**: The fix script handles data type conversions

### Issue: "RLS policy violation"
**Solution**: The fix script recreates all necessary policies

## Prevention

To prevent similar issues in the future:

1. **Data Validation**: Always validate data before inserting into profiles
2. **Default Values**: Use proper default values for all profile fields
3. **Error Handling**: Implement robust error handling in your application
4. **Regular Maintenance**: Periodically check for data inconsistencies
5. **Testing**: Test profile operations with various data scenarios

## Verification Checklist

After applying the fixes, verify:

- [ ] Profiles table has all required columns
- [ ] No NULL values in critical fields
- [ ] RLS policies are working correctly
- [ ] Profile pages load without errors
- [ ] Profile updates work properly
- [ ] New user profiles are created automatically
- [ ] Admin functions work correctly

## Support

If you continue to experience issues:

1. Check Supabase logs in your project dashboard
2. Review browser console for detailed error messages
3. Verify your Supabase project settings
4. Test with a fresh user account
5. Consider reaching out to Supabase support

---

**Note**: The fix scripts are designed to be safe and non-destructive. They will update existing structures and add missing components without losing data.
