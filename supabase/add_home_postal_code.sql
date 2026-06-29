-- Add home_postal_code to profiles (used for mileage origin + receipt address)
-- Run in Supabase Dashboard → SQL Editor (already applied to the live project)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_postal_code TEXT;
