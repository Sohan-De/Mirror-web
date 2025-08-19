-- Modify Key table to use 16-digit keys instead of UUIDs
-- First, drop the existing table if it exists
DROP TABLE IF EXISTS "Key";

-- Create Key table with 16-digit key column
CREATE TABLE "Key" (
    id SERIAL PRIMARY KEY,
    key_value VARCHAR(16) UNIQUE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "Key" ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to read Key table" ON "Key";
DROP POLICY IF EXISTS "Service role can do all operations on Key table" ON "Key";

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read Key table" 
    ON "Key" 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Allow service role to manage all records
CREATE POLICY "Service role can do all operations on Key table" 
    ON "Key" 
    USING (auth.role() = 'service_role');

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_key_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_key_updated_at_trigger ON "Key";

CREATE TRIGGER update_key_updated_at_trigger
    BEFORE UPDATE ON "Key"
    FOR EACH ROW
    EXECUTE FUNCTION update_key_updated_at();

-- Add comment to table
COMMENT ON TABLE "Key" IS 'Key table for storing 16-digit keys';

-- Function to generate random 16-digit keys
CREATE OR REPLACE FUNCTION generate_16_digit_key()
RETURNS VARCHAR(16) AS $$
DECLARE
    key_val VARCHAR(16);
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generate a random 16-digit number
        key_val := LPAD(FLOOR(RANDOM() * 10000000000000000)::TEXT, 16, '0');
        
        -- Check if this key already exists
        IF NOT EXISTS (SELECT 1 FROM "Key" WHERE key_value = key_val) THEN
            RETURN key_val;
        END IF;
        
        -- Prevent infinite loop
        counter := counter + 1;
        IF counter > 1000 THEN
            RAISE EXCEPTION 'Could not generate unique key after 1000 attempts';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
