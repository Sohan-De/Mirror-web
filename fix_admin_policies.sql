-- Fix the infinite recursion in admin policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create a secure function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  -- Direct query to bypass RLS
  SELECT is_admin INTO admin_status FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy for admins to view all profiles using the function
CREATE POLICY "Admins can view all profiles" 
  ON profiles 
  FOR SELECT 
  USING (is_admin() OR auth.uid() = id);

-- Create a policy for admins to update all profiles using the function
CREATE POLICY "Admins can update all profiles" 
  ON profiles 
  FOR UPDATE 
  USING (is_admin() OR auth.uid() = id);

-- Create a policy for admins to insert profiles
CREATE POLICY "Admins can insert profiles" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (is_admin() OR auth.uid() = id);

-- Create a policy for admins to delete profiles
CREATE POLICY "Admins can delete profiles" 
  ON profiles 
  FOR DELETE 
  USING (is_admin());
