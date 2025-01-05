-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "Public can view visible ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "Users can view their own ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "Users can view their claimed ghost profiles" ON ghost_profiles;

-- Create new simplified policies
-- Service role has full access
CREATE POLICY "Service role has full access"
  ON ghost_profiles
  FOR ALL
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

-- Users can view ghost profiles with their email
CREATE POLICY "Users can view their own ghost profiles"
  ON ghost_profiles
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL AND
    email = (
      SELECT email 
      FROM auth.users 
      WHERE id = auth.uid() 
      LIMIT 1
    )
  );

-- Users can view their claimed ghost profiles
CREATE POLICY "Users can view their claimed ghost profiles"
  ON ghost_profiles
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL AND
    claimed_profile_id = auth.uid()
  );

-- Public can view visible ghost profiles
CREATE POLICY "Public can view visible ghost profiles"
  ON ghost_profiles
  FOR SELECT
  USING (is_visible = true); 