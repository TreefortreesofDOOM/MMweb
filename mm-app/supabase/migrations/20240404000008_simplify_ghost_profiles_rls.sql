-- Drop all existing policies
DROP POLICY IF EXISTS "ALL Admin service role has full access" ON ghost_profiles;
DROP POLICY IF EXISTS "ALL Admins have full access to ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "SELECT Artists can view purchaser profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "SELECT Public can view visible ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "SELECT Public can view visible profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "ALL Service role has full access" ON ghost_profiles;
DROP POLICY IF EXISTS "SELECT Users can view their claimed ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "SELECT Users can view their own ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "service_role_access" ON ghost_profiles;
DROP POLICY IF EXISTS "user_own_ghost_profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "user_claimed_ghost_profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "artist_purchaser_profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "public_visible_profiles" ON ghost_profiles;

-- Disable RLS temporarily to avoid any issues during policy changes
ALTER TABLE ghost_profiles DISABLE ROW LEVEL SECURITY;

-- Create minimal policies
-- Enable RLS
ALTER TABLE ghost_profiles ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "service_role_full_access"
  ON ghost_profiles
  FOR ALL
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

-- Users can view their own unclaimed ghost profiles
CREATE POLICY "user_view_own_unclaimed"
  ON ghost_profiles
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL AND
    is_claimed = false AND
    email = auth.jwt()->>'email'
  );

-- Users can view their claimed ghost profiles
CREATE POLICY "user_view_claimed"
  ON ghost_profiles
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL AND
    is_claimed = true AND
    claimed_profile_id = auth.uid()
  ); 