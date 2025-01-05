-- Drop all existing policies
DROP POLICY IF EXISTS "ALL Admin service role has full access" ON ghost_profiles;
DROP POLICY IF EXISTS "ALL Admins have full access to ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "SELECT Artists can view purchaser profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "SELECT Public can view visible ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "SELECT Public can view visible profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "ALL Service role has full access" ON ghost_profiles;
DROP POLICY IF EXISTS "SELECT Users can view their claimed ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "SELECT Users can view their own ghost profiles" ON ghost_profiles;

-- Create new simplified policies
-- Service role has full access (for admin operations)
CREATE POLICY "service_role_access"
  ON ghost_profiles
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Users can view and claim ghost profiles with their email
CREATE POLICY "user_own_ghost_profiles"
  ON ghost_profiles
  FOR ALL
  USING (
    auth.jwt() IS NOT NULL AND
    email = (
      SELECT email 
      FROM auth.users 
      WHERE id = auth.uid() 
      LIMIT 1
    )
  )
  WITH CHECK (
    auth.jwt() IS NOT NULL AND
    email = (
      SELECT email 
      FROM auth.users 
      WHERE id = auth.uid() 
      LIMIT 1
    )
  );

-- Users can view their claimed ghost profiles
CREATE POLICY "user_claimed_ghost_profiles"
  ON ghost_profiles
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL AND
    claimed_profile_id = auth.uid()
  );

-- Artists can view anonymized ghost profiles that purchased their art
CREATE POLICY "artist_purchaser_profiles"
  ON ghost_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'verified_artist' OR role = 'emerging_artist')
      AND EXISTS (
        SELECT 1 
        FROM transactions 
        WHERE ghost_profile_id = ghost_profiles.id 
        AND artist_id = auth.uid()
      )
    )
  );

-- Public can view visible ghost profiles
CREATE POLICY "public_visible_profiles"
  ON ghost_profiles
  FOR SELECT
  USING (is_visible = true); 