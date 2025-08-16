# 🔧 Fix Subscription Packages RLS Policies

## 🚨 **Problem Identified:**
Your `subscription_packages` table has Row Level Security (RLS) policies that are blocking:
- **Reading plans** (406 Not Acceptable)
- **Creating plans** (403 Forbidden) 
- **Updating plans** (RLS policy violation)

## ✅ **Solution:**
Run the SQL script `fix_subscription_packages_rls.sql` in your Supabase SQL editor.

## 📋 **Steps to Fix:**

### **Step 1: Open Supabase Dashboard**
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: `hyimlsdqexkbltlhjctp`

### **Step 2: Open SQL Editor**
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**

### **Step 3: Run the Fix Script**
1. Copy the entire content of `fix_subscription_packages_rls.sql`
2. Paste it into the SQL editor
3. Click **"Run"**

### **Step 4: Verify the Fix**
1. Go to **"Authentication"** → **"Policies"**
2. Look for `subscription_packages` table
3. You should see these policies:
   - `Enable read access for all users`
   - `Enable insert for authenticated users`
   - `Enable update for authenticated users`
   - `Enable delete for authenticated users`

## 🔍 **What the Script Does:**

### **1. Creates Table (if missing)**
```sql
CREATE TABLE IF NOT EXISTS subscription_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly',
    features TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2. Enables RLS**
```sql
ALTER TABLE subscription_packages ENABLE ROW LEVEL SECURITY;
```

### **3. Creates Access Policies**
- **Read**: All users can read plans (for pricing display)
- **Insert**: Authenticated users can create plans
- **Update**: Authenticated users can edit plans
- **Delete**: Authenticated users can delete plans

### **4. Adds Default Plans**
- **Free Plan**: $0, basic features
- **Pro Plan**: $9.99/month, advanced features
- **Business Plan**: $29.99/month, premium features

### **5. Sets Up Triggers**
- Automatically updates `updated_at` timestamp
- Grants necessary permissions to authenticated users

## 🎯 **Alternative: Admin-Only Access**
If you want only admin users to manage plans, uncomment the admin-only policies in the script:

```sql
-- Uncomment for admin-only access
CREATE POLICY "Enable insert for admin users" ON subscription_packages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );
```

## 🧪 **Test After Fix:**

### **1. Add New Plan**
- Click **"Add New Plan"** in admin dashboard
- Fill in details and click **"Add Plan"**
- Should see: ✅ "Plan created in database successfully!"

### **2. Edit Plan**
- Click **"Edit"** on any plan
- Modify details and click **"Save Changes"**
- Should see: ✅ "Plan updated in database successfully!"

### **3. Delete Plan**
- Click **"Delete"** on any plan
- Confirm deletion
- Should see: ✅ "Plan deleted from database successfully!"

### **4. Load Plans**
- Click **"🔄 Refresh Plans"**
- Should see: ✅ "Loaded X subscription plans from database!"

## 🚨 **If Still Having Issues:**

### **Check RLS Status:**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'subscription_packages';
```

### **Check Table Permissions:**
```sql
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'subscription_packages';
```

### **Check User Role:**
```sql
SELECT auth.role();
```

## 📞 **Need Help?**
If you're still having issues after running the script:
1. Check the Supabase logs for detailed error messages
2. Verify your user has the `authenticated` role
3. Make sure the `subscription_packages` table exists
4. Check if there are conflicting RLS policies

**Run the script and your subscription plan management should work perfectly!** 🎉
