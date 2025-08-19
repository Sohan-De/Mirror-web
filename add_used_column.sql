-- Add used column to existing Key table if it doesn't exist
DO $$
BEGIN
    -- Check if the used column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Key' 
        AND column_name = 'used'
    ) THEN
        -- Add the used column
        ALTER TABLE "Key" ADD COLUMN used BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added used column to Key table';
    ELSE
        RAISE NOTICE 'used column already exists in Key table';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'Key' 
ORDER BY ordinal_position;
