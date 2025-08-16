# Add Email Column to Profiles Table

## What This Script Does

The `add_email_column_to_profiles.sql` script adds a new `email` column to your profiles table and updates all existing functionality to use it.

## Benefits of Adding Email Column

✅ **Direct Access**: No need to join with `auth.users` table to get email  
✅ **Better Performance**: Faster queries when you need user email  
✅ **Data Consistency**: Email stored directly in profiles table  
✅ **Easier Queries**: Simpler SQL queries for admin dashboard  
✅ **Backup Safety**: Email data preserved even if auth.users has issues  

## What Gets Added

### 1. **New Email Column**
- **Column Name**: `email`
- **Data Type**: `TEXT`
- **Constraints**: `NOT NULL` (after population)
- **Index**: Added for better query performance

### 2. **Updated Functions**
- **`create_profile_for_user()`**: Now saves email during user signup
- **`update_existing_profiles_with_user_data()`**: Updates existing profiles with email
- **`create_or_update_user_profile()`**: Handles email in manual profile operations

### 3. **Data Population**
- **Existing Profiles**: Automatically populated with email from `auth.users`
- **New Profiles**: Email saved automatically during creation
- **Data Integrity**: Ensures all profiles have email information

## How to Apply

### Step 1: Run the Script
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `add_email_column_to_profiles.sql`
4. Click "Run" to execute the script

### Step 2: Verify the Changes
The script will automatically show you:
- Updated table structure
- Profile count with email data
- Sample of updated profiles

## What Happens During Execution

### **Phase 1: Column Addition**
```sql
ALTER TABLE profiles ADD COLUMN email TEXT;
```

### **Phase 2: Data Population**
```sql
UPDATE profiles 
SET email = (SELECT u.email FROM auth.users u WHERE u.id = profiles.id)
WHERE email IS NULL;
```

### **Phase 3: Constraint Addition**
```sql
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;
```

### **Phase 4: Function Updates**
- Updates trigger function to save email
- Updates helper functions to handle email
- Ensures all future profiles include email

### **Phase 5: Performance Optimization**
```sql
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
```

## Expected Results

After running the script:

1. **New Column**: `email` column added to profiles table
2. **Data Populated**: All existing profiles get email from auth.users
3. **Functions Updated**: All profile functions now handle email
4. **Performance**: Index added for faster email-based queries
5. **Future Signups**: New users automatically get email saved in profile

## Updated Table Structure

Your profiles table will now have:

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | - |
| **email** | **text** | **NO** | **-** |
| first_name | text | YES | '' |
| last_name | text | YES | '' |
| avatar_url | text | YES | '' |
| website | text | YES | '' |
| company | text | YES | '' |
| job_title | text | YES | '' |
| bio | text | YES | '' |
| subscription_tier | text | YES | 'free' |
| subscription_status | text | YES | 'active' |
| subscription_start | timestamp | YES | - |
| subscription_end | timestamp | YES | - |
| is_admin | boolean | YES | false |
| created_at | timestamp | YES | now() |
| updated_at | timestamp | YES | now() |

## Usage Examples

### **Query Users by Email**
```sql
-- Before (required JOIN)
SELECT p.*, u.email 
FROM profiles p 
JOIN auth.users u ON p.id = u.id 
WHERE u.email LIKE '%@example.com';

-- After (direct query)
SELECT * FROM profiles 
WHERE email LIKE '%@example.com';
```

### **Admin Dashboard User List**
```sql
-- Simple query for admin dashboard
SELECT id, email, first_name, last_name, is_admin, created_at
FROM profiles 
ORDER BY created_at DESC;
```

### **Update User Profile**
```sql
-- Update profile with email
UPDATE profiles 
SET 
    first_name = 'John',
    last_name = 'Doe',
    email = 'john.doe@example.com',
    updated_at = NOW()
WHERE id = 'user-uuid-here';
```

## Verification Steps

After running the script, verify:

1. **Column Added**: Check if `email` column exists in profiles table
2. **Data Populated**: Verify existing profiles have email data
3. **Functions Work**: Test new user signup to ensure email is saved
4. **Performance**: Notice faster queries when filtering by email

## Troubleshooting

### Issue: Email column not added
**Solution**: Check if the ALTER TABLE command executed successfully

### Issue: Existing profiles don't have email
**Solution**: Run the UPDATE command manually to populate email data

### Issue: Functions not updated
**Solution**: Check if the CREATE OR REPLACE commands executed without errors

### Issue: Performance issues
**Solution**: Verify the email index was created successfully

## Next Steps

After adding the email column:

1. **Update Frontend**: Modify your admin dashboard to display email directly
2. **Optimize Queries**: Update any queries that currently JOIN with auth.users
3. **Test Functionality**: Ensure new user signups save email correctly
4. **Monitor Performance**: Check if queries are faster with the new structure

---

**Note**: This change is backward compatible. Your existing code will continue to work, but you can now optimize it to use the email column directly instead of joining with auth.users.
