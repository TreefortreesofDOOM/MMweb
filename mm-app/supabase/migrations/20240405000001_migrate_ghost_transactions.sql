-- Migrate existing ghost profile transactions to collections
DO $BLOCK$
DECLARE
  ghost_transaction RECORD;
  purchase_collection_id UUID;
  has_valid_transactions BOOLEAN;
BEGIN
  -- First handle ghost profiles that have been claimed (have buyer_id)
  FOR ghost_transaction IN 
    SELECT DISTINCT t.ghost_profile_id, t.buyer_id
    FROM transactions t
    JOIN ghost_profiles gp ON t.ghost_profile_id = gp.id
    WHERE t.ghost_profile_id IS NOT NULL
      AND t.buyer_id IS NOT NULL
      AND t.status = 'succeeded'
      AND t.artwork_id IS NOT NULL
      AND gp.is_claimed = true
      AND NOT EXISTS (
        SELECT 1 FROM collections c
        WHERE c.patron_id = t.buyer_id
          AND c.is_purchased = true
      )
  LOOP
    -- Check if there are any valid transactions for this ghost profile
    SELECT EXISTS (
      SELECT 1
      FROM transactions t
      WHERE t.ghost_profile_id = ghost_transaction.ghost_profile_id
        AND t.status = 'succeeded'
        AND t.artwork_id IS NOT NULL
    ) INTO has_valid_transactions;

    -- Only create collection if there are valid transactions
    IF has_valid_transactions THEN
      -- Create purchased works collection for claimed profiles
      INSERT INTO collections (
        name,
        description,
        patron_id,
        is_purchased,
        is_private
      ) VALUES (
        'Purchased Works',
        'Your collection of purchased artworks',
        ghost_transaction.buyer_id,
        true,
        false
      ) RETURNING id INTO purchase_collection_id;

      -- Add all purchased artworks to the collection
      INSERT INTO collection_items (
        collection_id,
        artwork_id,
        notes,
        added_at
      )
      SELECT 
        purchase_collection_id,
        t.artwork_id,
        'Purchased on ' || t.created_at::date,
        t.created_at
      FROM transactions t
      WHERE t.ghost_profile_id = ghost_transaction.ghost_profile_id
        AND t.status = 'succeeded'
        AND t.artwork_id IS NOT NULL
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Then handle unclaimed ghost profiles (no buyer_id)
  FOR ghost_transaction IN 
    SELECT DISTINCT gp.id as ghost_profile_id
    FROM ghost_profiles gp
    JOIN transactions t ON t.ghost_profile_id = gp.id
    WHERE t.status = 'succeeded'
      AND t.artwork_id IS NOT NULL
      AND gp.is_claimed = false
      AND NOT EXISTS (
        SELECT 1 FROM collections c
        WHERE c.ghost_profile_id = gp.id
          AND c.is_purchased = true
      )
  LOOP
    -- Check if there are any valid transactions for this ghost profile
    SELECT EXISTS (
      SELECT 1
      FROM transactions t
      WHERE t.ghost_profile_id = ghost_transaction.ghost_profile_id
        AND t.status = 'succeeded'
        AND t.artwork_id IS NOT NULL
    ) INTO has_valid_transactions;

    -- Only create collection if there are valid transactions
    IF has_valid_transactions THEN
      -- Create purchased works collection for unclaimed ghost profiles
      INSERT INTO collections (
        name,
        description,
        ghost_profile_id,
        is_purchased,
        is_private
      ) VALUES (
        'Purchased Works',
        'Your collection of purchased artworks',
        ghost_transaction.ghost_profile_id,
        true,
        false
      ) RETURNING id INTO purchase_collection_id;

      -- Add all purchased artworks to the collection
      INSERT INTO collection_items (
        collection_id,
        artwork_id,
        notes,
        added_at
      )
      SELECT 
        purchase_collection_id,
        t.artwork_id,
        'Purchased on ' || t.created_at::date,
        t.created_at
      FROM transactions t
      WHERE t.ghost_profile_id = ghost_transaction.ghost_profile_id
        AND t.status = 'succeeded'
        AND t.artwork_id IS NOT NULL
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$BLOCK$ LANGUAGE plpgsql; 