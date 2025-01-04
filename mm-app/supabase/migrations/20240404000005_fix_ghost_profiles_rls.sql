-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "Public can view visible ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "Artists can view ghost profiles that bought their art" ON ghost_profiles;

-- Create new simplified policies
-- Admin access via service role
CREATE POLICY "Admin service role has full access"
  ON ghost_profiles
  FOR ALL
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

-- Public read-only access for visible profiles
CREATE POLICY "Public can view visible profiles"
  ON ghost_profiles
  FOR SELECT
  USING (is_visible = true);

-- Artists can view profiles that purchased their art
CREATE POLICY "Artists can view purchaser profiles"
  ON ghost_profiles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM transactions t
    JOIN artworks a ON t.artwork_id = a.id
    WHERE t.ghost_profile_id = ghost_profiles.id
    AND a.artist_id = auth.uid()
  ));

-- Add comment explaining the policies
COMMENT ON TABLE ghost_profiles IS 'Ghost profiles for guest purchasers with RLS policies:
- Admin service role has full access
- Public can view visible profiles
- Artists can view profiles that purchased their art'; 