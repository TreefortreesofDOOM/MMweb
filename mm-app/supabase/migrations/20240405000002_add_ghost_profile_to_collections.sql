-- Add ghost_profile_id to collections
ALTER TABLE collections
  ADD COLUMN ghost_profile_id UUID REFERENCES ghost_profiles(id),
  ADD CONSTRAINT check_profile_reference 
    CHECK (
      (patron_id IS NOT NULL AND ghost_profile_id IS NULL) OR 
      (patron_id IS NULL AND ghost_profile_id IS NOT NULL)
    );

-- Update RLS policies to handle ghost profiles
CREATE POLICY "Ghost profiles can view their collections"
  ON collections
  FOR SELECT
  USING (
    ghost_profile_id = auth.uid() OR
    (NOT is_private AND ghost_profile_id IN (
      SELECT id FROM ghost_profiles
      WHERE is_visible = true
    ))
  ); 