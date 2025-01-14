-- Fix transaction recursion in RLS policies
BEGIN;

-- First, create new indexes to support the optimized policies
CREATE INDEX IF NOT EXISTS idx_transactions_ghost_profile_status 
ON transactions(ghost_profile_id, status);

CREATE INDEX IF NOT EXISTS idx_ghost_profiles_email 
ON ghost_profiles(email);

CREATE INDEX IF NOT EXISTS idx_ghost_profiles_claimed 
ON ghost_profiles(claimed_profile_id);

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view transactions for their claimed ghost profiles" ON transactions;
DROP POLICY IF EXISTS "Artists can view ghost profiles that bought their art" ON ghost_profiles;

-- Create new flattened policy for transactions
CREATE POLICY "Users can view transactions"
ON transactions FOR SELECT
USING (
  -- Direct user access
  buyer_id = auth.uid() 
  OR artist_id = auth.uid()
  -- Ghost profile access via email (no recursion)
  OR (
    ghost_profile_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = (
        SELECT email FROM ghost_profiles 
        WHERE id = transactions.ghost_profile_id
      )
    )
  )
  -- Claimed ghost profile access (no recursion)
  OR (
    ghost_profile_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM ghost_profiles 
      WHERE id = transactions.ghost_profile_id 
      AND claimed_profile_id = auth.uid()
    )
  )
);

-- Create new flattened policy for ghost profiles
CREATE POLICY "Artists can view ghost profiles"
ON ghost_profiles FOR SELECT
USING (
  -- Direct artist access via artworks (no transaction dependency)
  EXISTS (
    SELECT 1 FROM artworks 
    WHERE artist_id = auth.uid() 
    AND id IN (
      SELECT artwork_id FROM transactions 
      WHERE ghost_profile_id = ghost_profiles.id
      AND status = 'succeeded'
    )
  )
  -- Keep existing direct access policies
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR claimed_profile_id = auth.uid()
  OR is_visible = true
);

-- Verify and clean up any existing invalid policies
DO $$
BEGIN
  -- Check for any remaining recursive policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('transactions', 'ghost_profiles')
    AND policyname LIKE '%recursive%'
  ) THEN
    RAISE NOTICE 'Found potentially recursive policies that should be reviewed';
  END IF;
END $$;

COMMIT;

-- ROLLBACK MIGRATION
/*
BEGIN;

-- Drop new policies
DROP POLICY IF EXISTS "Users can view transactions" ON transactions;
DROP POLICY IF EXISTS "Artists can view ghost profiles" ON ghost_profiles;

-- Drop new indexes
DROP INDEX IF EXISTS idx_transactions_ghost_profile_status;
DROP INDEX IF EXISTS idx_ghost_profiles_email;
DROP INDEX IF EXISTS idx_ghost_profiles_claimed;

-- Restore original policies
CREATE POLICY "Users can view transactions for their claimed ghost profiles"
ON transactions FOR SELECT
USING (
  ghost_profile_id IN (
    SELECT id FROM ghost_profiles 
    WHERE claimed_profile_id = auth.uid()
  )
);

CREATE POLICY "Artists can view ghost profiles that bought their art"
ON ghost_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM transactions t
    JOIN artworks a ON t.artwork_id = a.id
    WHERE a.artist_id = auth.uid()
    AND t.ghost_profile_id = ghost_profiles.id
  )
);

COMMIT;
*/ 