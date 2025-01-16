-- Drop the old constraint first
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_verification_status_check;

-- Drop the old trigger
DROP TRIGGER IF EXISTS update_verification_status_timestamp ON public.profiles;

-- Drop the old function 
DROP FUNCTION IF EXISTS update_verification_status_timestamp();

-- Now rename the columns
ALTER TABLE profiles 
  RENAME COLUMN verification_status TO application_status;

ALTER TABLE profiles 
  RENAME COLUMN verification_status_updated_at TO application_status_updated_at;

-- Update existing data to match new status values
UPDATE profiles 
SET application_status = 
  CASE 
    WHEN application_status = 'in_progress' THEN 'pending'
    WHEN application_status = 'verified' THEN 'approved'
    ELSE application_status
  END;

-- Create new trigger function
CREATE OR REPLACE FUNCTION update_application_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.application_status_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER update_application_status_timestamp
  BEFORE UPDATE OF application_status
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_application_status_timestamp();

-- Add the new constraint
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_application_status_check 
  CHECK (application_status IN ('not_started', 'pending', 'approved', 'rejected')); 