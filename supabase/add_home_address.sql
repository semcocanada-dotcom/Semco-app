-- Add home address fields to profiles for mileage auto-calculation
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS home_address  TEXT,
  ADD COLUMN IF NOT EXISTS home_city     TEXT;
