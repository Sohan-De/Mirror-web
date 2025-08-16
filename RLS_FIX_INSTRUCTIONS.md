# How to Fix the Infinite Recursion Error in Supabase RLS Policies

You're encountering the error: **"infinite recursion detected in policy for relation 'profiles'"**. This happens when a Row Level Security (RLS) policy tries to check itself recursively.

## The Problem

Your current RLS policies for admin users are causing an infinite loop:
1. The policy checks if the user is an admin
2. To check if the user is an admin, it needs to query the profiles table
3. But querying the profiles table triggers the RLS policy again
4. This creates an infinite recursion

## Solution: Apply the SQL Fix

I've created a SQL script (`fix_rls_policies.sql`) that fixes this issue. Here's how to apply it:

### Option 1: Using the Supabase Dashboard

1. Log in to your Supabase dashboard at https://app.supabase.io/
2. Select your project
3. Go to the "SQL Editor" section
4. Create a new query
5. Copy and paste the entire contents of the `fix_rls_policies.sql` file
6. Click "Run" to execute the SQL

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push --db-url=YOUR_SUPABASE_DB_URL fix_rls_policies.sql
```

## What the Fix Does

1. **Drops the problematic policies** that are causing the infinite recursion
2. **Creates a new `is_admin()` function** with the `SECURITY DEFINER` attribute, which allows it to bypass RLS
3. **Creates new policies** that use this function to safely check admin status
4. **Ensures regular users** can still access their own profiles

## Temporary Workaround

While you apply the fix, I've updated the `admin.js` file with a temporary workaround that:
1. Bypasses the RLS check
2. Allows access to the admin dashboard for debugging
3. Logs detailed information to help diagnose any remaining issues

## After Applying the Fix

After applying the SQL fix:

1. Refresh your admin dashboard page
2. Check the browser console for any remaining errors
3. You should now see your users loading correctly
4. If you still have issues, try removing the `admin-debug.js` script from `admin-dashboard.html` as it may no longer be needed

## Need More Help?

If you continue to have issues after applying the fix:
1. Check the browser console for specific error messages
2. Look at the Supabase logs in your dashboard
3. Make sure your admin user actually has `is_admin` set to `true` in the profiles table
