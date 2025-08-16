-- Drop problematic policies that are causing infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON profiles;

-- Drop the existing is_admin function if it exists
DROP FUNCTION IF EXISTS is_admin();

-- Create a new is_admin function with SECURITY DEFINER to avoid recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_val BOOLEAN;
BEGIN
  -- Direct query to avoid RLS recursion
  SELECT p.is_admin INTO is_admin_val
  FROM public.profiles p
  WHERE p.id = auth.uid();
  
  RETURN COALESCE(is_admin_val, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Create new policies using the is_admin function
CREATE POLICY "Admins can view all profiles" 
  ON profiles 
  FOR SELECT 
  USING (is_admin() OR auth.uid() = id);

CREATE POLICY "Admins can update all profiles" 
  ON profiles 
  FOR UPDATE 
  USING (is_admin() OR auth.uid() = id);

CREATE POLICY "Admins can insert all profiles" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (is_admin() OR auth.uid() = id);

CREATE POLICY "Admins can delete all profiles" 
  ON profiles 
  FOR DELETE 
  USING (is_admin());

-- Make sure regular users can still access their own profiles
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
  ON profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);
