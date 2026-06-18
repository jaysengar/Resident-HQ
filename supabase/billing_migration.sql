-- Run this in your Supabase SQL Editor to support recurring billing and expiry

ALTER TABLE societies
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone DEFAULT timezone('utc'::text, now() + interval '30 days');

-- Fix any missing privileges
GRANT ALL PRIVILEGES ON TABLE societies TO postgres, anon, authenticated, service_role;
