-- Add postal_code and notes columns to providers table
-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE providers ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS notes TEXT;
