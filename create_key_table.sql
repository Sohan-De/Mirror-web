-- Create Key table
CREATE TABLE IF NOT EXISTS "Key" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "Key" ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (you can modify these later as needed)
-- Drop existing policies if they exist
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
COMMENT ON TABLE "Key" IS 'Key table for storing key-related data';
