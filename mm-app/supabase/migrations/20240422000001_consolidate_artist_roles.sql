-- Step 1: Ensure all profiles have correct role values before removing artist_type
UPDATE profiles
SET role = 
  CASE 
    WHEN artist_type = 'verified' THEN 'verified_artist'
    WHEN artist_type = 'emerging' THEN 'emerging_artist'
    ELSE role
  END
WHERE artist_type IS NOT NULL;

-- Step 2: Drop artist_type column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS artist_type;

-- Step 3: Add role validation trigger
CREATE OR REPLACE FUNCTION validate_artist_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role NOT IN ('admin', 'verified_artist', 'emerging_artist', 'patron', 'user') THEN
    RAISE EXCEPTION 'Invalid role value: %', NEW.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_artist_role_trigger ON profiles;
CREATE TRIGGER validate_artist_role_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_artist_role(); 