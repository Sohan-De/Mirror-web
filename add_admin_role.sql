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
