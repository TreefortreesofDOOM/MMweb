-- Function to revert a claimed ghost profile
CREATE OR REPLACE FUNCTION revert_claimed_ghost_profile(
  target_ghost_profile_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed_user_id uuid;
  collection_ids uuid[];
BEGIN
  -- Get the claimed user ID
  SELECT claimed_profile_id INTO claimed_user_id
  FROM ghost_profiles
  WHERE id = target_ghost_profile_id;

  -- Get collection IDs associated with the user
  SELECT array_agg(id) INTO collection_ids
  FROM collections
  WHERE patron_id = claimed_user_id;

  -- Delete collection items first (due to foreign key constraints)
  DELETE FROM collection_items
  WHERE collection_id = ANY(collection_ids);

  -- Delete collections
  DELETE FROM collections
  WHERE patron_id = claimed_user_id;

  -- Revert transactions back to ghost profile only
  UPDATE transactions
  SET 
    buyer_id = NULL,
    metadata = metadata - 'claiming_history'
  WHERE ghost_profile_id = target_ghost_profile_id;

  -- Reset ghost profile to unclaimed state
  UPDATE ghost_profiles
  SET 
    is_claimed = false,
    claimed_profile_id = NULL,
    metadata = metadata - 'claimed_at'
  WHERE id = target_ghost_profile_id;
END;
$$;

-- Example usage (uncomment and replace with actual UUID):
-- SELECT revert_claimed_ghost_profile('00000000-0000-0000-0000-000000000000'::uuid); 