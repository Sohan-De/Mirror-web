-- Fix RLS policies for key_delivery_logs table
-- Run this in Supabase SQL Editor

-- Add INSERT policy
CREATE POLICY "Allow insert key delivery logs" ON "key_delivery_logs"
FOR INSERT TO authenticated
WITH CHECK (true);

-- Add SELECT policy  
CREATE POLICY "Allow select key delivery logs" ON "key_delivery_logs"
FOR SELECT TO authenticated
USING (true);

-- Add UPDATE policy
CREATE POLICY "Allow update key delivery logs" ON "key_delivery_logs"
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Check if policies were created
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'key_delivery_logs';
