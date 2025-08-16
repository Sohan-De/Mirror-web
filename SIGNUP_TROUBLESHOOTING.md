# Signup 500 Internal Server Error - Troubleshooting Guide

## Problem Description
You're experiencing a 500 Internal Server Error when users try to sign up, with the error message "Database error saving new user".

## Root Cause
The issue is in the database trigger function `create_profile_for_user()` that automatically creates a user profile when a new user signs up. The trigger is failing, likely due to:

1. **Metadata Access Issues**: The trigger tries to access `NEW.raw_user_meta_data` which may have changed structure
2. **Permission Issues**: The trigger function may not have proper permissions
3. **Table Structure Issues**: Missing columns or incorrect RLS policies
4. **Trigger Execution Errors**: The trigger function is throwing exceptions

## Solution Steps

### Step 1: Apply the Database Fix
Run the SQL script `fix_signup_trigger.sql` in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `fix_signup_trigger.sql`
4. Click "Run" to execute the script

This script will:
- Drop the problematic trigger and function
- Create a more robust profile creation function
- Handle metadata access safely
- Add error handling to prevent failures
- Fix RLS policies
- Ensure proper permissions

### Step 2: Test the Fix
After running the SQL script:

1. Try to sign up a new user
2. Check the browser console for any remaining errors
3. Verify that a profile is created in the `profiles` table

### Step 3: If Issues Persist - Debug Mode
If you're still experiencing issues, temporarily add the debug script:

1. Add this line to your `sign-up.html` before the closing `</body>` tag:
   ```html
   <script src="debug_signup.js"></script>
   ```

2. Update your signup form to use the enhanced error handling:
   ```javascript
   // Replace your existing signup call with:
   const { data, error } = await enhancedSignup({
       email: email,
       password: password,
       userData: userData
   });
   ```

3. Check the browser console for detailed error information

## Alternative Solutions

### Option 1: Disable Auto-Profile Creation
If you want to temporarily disable automatic profile creation:

```sql
-- Drop the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create profiles manually or through your application logic
```

### Option 2: Manual Profile Creation
Create profiles manually after user signup in your JavaScript:

```javascript
async function createProfileAfterSignup(userId, userData) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error creating profile:', error);
        return { data: null, error };
    }
}
```

## Verification Steps

After applying the fix, verify:

1. **Database Structure**: Check that the `profiles` table has all required columns
2. **RLS Policies**: Ensure Row Level Security policies are working correctly
3. **Trigger Function**: Verify the trigger function executes without errors
4. **User Signup**: Test creating new user accounts
5. **Profile Creation**: Confirm profiles are automatically created

## Common Issues and Solutions

### Issue: "Function does not exist"
**Solution**: Ensure you're running the SQL script in the correct Supabase project

### Issue: "Permission denied"
**Solution**: Check that your database user has the necessary permissions

### Issue: "Table does not exist"
**Solution**: Run the `create_profile_table.sql` script first

### Issue: "RLS policy violation"
**Solution**: The fix script includes proper RLS policy updates

## Prevention

To prevent similar issues in the future:

1. **Test Triggers**: Always test database triggers with various data scenarios
2. **Error Handling**: Include proper error handling in trigger functions
3. **Permissions**: Ensure trigger functions have appropriate security contexts
4. **Monitoring**: Monitor database logs for trigger execution errors
5. **Backup**: Keep backups of working database schemas

## Support

If you continue to experience issues after applying these fixes:

1. Check the Supabase logs in your project dashboard
2. Review the browser console for detailed error messages
3. Verify your Supabase project settings and configuration
4. Consider reaching out to Supabase support for database-specific issues

---

**Note**: The fix script is designed to be safe and non-destructive. It will update existing structures and add missing components without losing data.
