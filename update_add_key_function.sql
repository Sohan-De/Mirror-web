-- Update the add_key_by_admin function to include plan_id parameter
-- This will allow admins to assign keys to specific subscription plans

-- Drop the old function first
DROP FUNCTION IF EXISTS add_key_by_admin(TEXT, BOOLEAN);

-- Create the updated add key function with plan_id
CREATE OR REPLACE FUNCTION add_key_by_admin(
    key_value TEXT, 
    plan_id INTEGER,
    is_used BOOLEAN DEFAULT FALSE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_key_id INTEGER;
    plan_exists BOOLEAN;
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
    
    -- Validate plan_id exists in subscription_packages
    SELECT EXISTS(
        SELECT 1 FROM subscription_packages 
        WHERE id = add_key_by_admin.plan_id
    ) INTO plan_exists;
    
    IF NOT plan_exists THEN
        RAISE EXCEPTION 'Invalid plan_id: Plan does not exist';
    END IF;
    
    -- Check if key already exists
    IF EXISTS (
        SELECT 1 FROM "Key" k WHERE k.key_value = add_key_by_admin.key_value
    ) THEN
        RAISE EXCEPTION 'Key already exists';
    END IF;
    
    -- Insert the new key with plan_id
    INSERT INTO "Key" (key_value, plan_id, used, created_at, updated_at)
    VALUES (add_key_by_admin.key_value, add_key_by_admin.plan_id, is_used, NOW(), NOW())
    RETURNING id INTO new_key_id;
    
    -- Return the new key ID
    RETURN new_key_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_key_by_admin(TEXT, INTEGER, BOOLEAN) TO authenticated;

-- Test the updated function
-- SELECT add_key_by_admin('TEST1234567890123', 3, false); -- Pro plan

-- Verify the function was created
SELECT 
    proname,
    prosrc,
    proacl
FROM pg_proc 
WHERE proname = 'add_key_by_admin';

-- Show function parameters
SELECT 
    p.proname,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
WHERE p.proname = 'add_key_by_admin';
