-- Create a function to delete keys that bypasses RLS for admin users
-- This will help resolve the deletion issue

-- Create the delete function
CREATE OR REPLACE FUNCTION delete_key_by_id(key_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Only admin users can delete keys';
    END IF;
    
    -- Delete the key
    DELETE FROM "Key" WHERE id = key_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Return true if key was deleted
    RETURN deleted_count > 0;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_key_by_id(INTEGER) TO authenticated;

-- Test the function
-- SELECT delete_key_by_id(5);

-- Verify the function was created
SELECT 
    proname,
    prosrc,
    proacl
FROM pg_proc 
WHERE proname = 'delete_key_by_id';
