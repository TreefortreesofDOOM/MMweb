-- Add location field to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS location text;

-- Add comment for documentation
COMMENT ON COLUMN profiles.location IS 'The location/city of the artist'; 