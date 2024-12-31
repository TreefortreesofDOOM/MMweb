-- Add medium column to profiles table
ALTER TABLE profiles
ADD COLUMN medium text[] DEFAULT ARRAY[]::text[];

-- Add comment to describe the column
COMMENT ON COLUMN profiles.medium IS 'Array of mediums the artist works with (e.g., ["oil", "acrylic", "digital"])';

-- Create an index for faster searches on the medium column
CREATE INDEX idx_profiles_medium ON profiles USING GIN (medium);

-- Grant necessary permissions
GRANT SELECT ON profiles TO anon, authenticated;
GRANT UPDATE (medium) ON profiles TO authenticated; 