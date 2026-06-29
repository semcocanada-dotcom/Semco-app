-- Add organization column to providers table
-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE providers ADD COLUMN IF NOT EXISTS organization TEXT;
