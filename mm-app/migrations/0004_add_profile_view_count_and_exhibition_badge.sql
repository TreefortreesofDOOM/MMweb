-- Add view_count and exhibition_badge columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS exhibition_badge boolean DEFAULT false; 