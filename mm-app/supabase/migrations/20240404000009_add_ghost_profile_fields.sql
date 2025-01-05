-- Add ghost profile fields to profiles table if they don't exist
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS total_purchases INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_spent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_purchase_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ghost_profile_claimed BOOLEAN DEFAULT FALSE; 