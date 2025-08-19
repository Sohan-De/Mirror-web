-- Create key delivery logs table to track key deliveries
CREATE TABLE IF NOT EXISTS key_delivery_logs (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    key_value VARCHAR(16) NOT NULL,
    package_name VARCHAR(100) NOT NULL,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'delivered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE key_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own delivery logs" ON key_delivery_logs;
DROP POLICY IF EXISTS "Service role can manage all delivery logs" ON key_delivery_logs;

-- Allow users to view their own delivery logs
CREATE POLICY "Users can view their own delivery logs" 
    ON key_delivery_logs 
    FOR SELECT 
    USING (user_email = auth.jwt() ->> 'email');

-- Allow service role to manage all delivery logs
CREATE POLICY "Service role can manage all delivery logs" 
    ON key_delivery_logs 
    USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_key_delivery_logs_user_email ON key_delivery_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_key_delivery_logs_delivered_at ON key_delivery_logs(delivered_at);

-- Add comment
COMMENT ON TABLE key_delivery_logs IS 'Logs all key deliveries to users after successful payments';
