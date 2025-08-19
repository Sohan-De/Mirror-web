-- Create a function to add keys that bypasses RLS for admin users
-- This will resolve the INSERT permission issue

-- Create the add key function
CREATE OR REPLACE FUNCTION add_key_by_admin(key_value TEXT, is_used BOOLEAN DEFAULT FALSE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_key_id INTEGER;
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Only admin users can add keys';
    END IF;
    
    -- Validate key length
    IF LENGTH(key_value) != 16 THEN
        RAISE EXCEPTION 'Key must be exactly 16 characters long';
    END IF;
    
    -- Check if key already exists (fixed ambiguous reference)
    IF EXISTS (
        SELECT 1 FROM "Key" k WHERE k.key_value = add_key_by_admin.key_value
    ) THEN
        RAISE EXCEPTION 'Key already exists';
    END IF;
    
    -- Insert the new key
    INSERT INTO "Key" (key_value, used, created_at, updated_at)
    VALUES (add_key_by_admin.key_value, is_used, NOW(), NOW())
    RETURNING id INTO new_key_id;
    
    -- Return the new key ID
    RETURN new_key_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_key_by_admin(TEXT, BOOLEAN) TO authenticated;

-- Test the function
-- SELECT add_key_by_admin('TEST1234567890123', false);

-- Verify the function was created
SELECT 
    proname,
    prosrc,
    proacl
FROM pg_proc 
WHERE proname = 'add_key_by_admin';
