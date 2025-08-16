# Admin Dashboard Setup Guide

This guide explains how to set up and use the admin dashboard for Mirror Web.

## Table of Contents
1. [Database Setup](#database-setup)
2. [Creating the First Admin User](#creating-the-first-admin-user)
3. [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
4. [Admin Dashboard Features](#admin-dashboard-features)
5. [Managing Users](#managing-users)
6. [Adding New Admins](#adding-new-admins)

## Database Setup

Before using the admin dashboard, you need to apply the database migration to add the admin role field to the profiles table.

1. Log in to your Supabase project
2. Go to the SQL Editor
3. Copy and paste the contents of `add_admin_role.sql` into the SQL Editor
4. Run the SQL query to apply the changes

```sql
-- Add admin role field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create policy to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON profiles 
  FOR SELECT 
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- Create policy to allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" 
  ON profiles 
  FOR UPDATE 
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT is_admin FROM profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Creating the First Admin User

To create the first admin user, you need to manually update the database:

1. Sign up for a new account or use an existing account
2. Log in to your Supabase project
3. Go to the Table Editor and select the `profiles` table
4. Find your user record (you can filter by email or ID)
5. Click on the record to edit it
6. Set the `is_admin` field to `true`
7. Click Save

Alternatively, you can use SQL to set the admin status:

```sql
-- Replace 'YOUR_USER_ID' with your actual user ID
UPDATE profiles
SET is_admin = true
WHERE id = 'YOUR_USER_ID';
```

## Accessing the Admin Dashboard

Once you have admin privileges:

1. Log in to your account
2. You'll see an "Admin Dashboard" option in your profile dropdown menu
3. Click on "Admin Dashboard" to access the admin panel
4. If you don't see the admin option, try refreshing the page

## Admin Dashboard Features

The admin dashboard includes the following sections:

### Users Tab
- View all users in the system
- Search for specific users
- Edit user details
- Change user subscription tier and status
- Grant or revoke admin privileges
- Delete users

### Analytics Tab
- View total user count
- See premium user statistics
- Monitor user growth and activity

### Settings Tab
- Configure site settings
- Manage admin users
- Add new admin users

## Managing Users

To manage users:

1. Go to the "Users" tab
2. Use the search box to find specific users
3. Click the edit icon to modify a user's details
4. In the edit modal, you can:
   - Update name information
   - Change subscription tier
   - Change account status
   - Grant/revoke admin privileges
5. Click "Save Changes" to apply your changes

## Adding New Admins

To add a new admin:

1. Go to the "Settings" tab
2. Scroll down to the "Admin Users" section
3. Click "Add New Admin"
4. Enter the email address of an existing user
5. Click "Add Admin"

The user will now have admin privileges and can access the admin dashboard.

---

**Note:** Be careful when granting admin privileges. Admins have full access to manage all users and site settings.
