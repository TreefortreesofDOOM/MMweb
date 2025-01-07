-- Drop existing trigger and function
DROP TRIGGER IF EXISTS transaction_add_to_collection ON transactions;
DROP FUNCTION IF EXISTS add_artwork_to_collection;
DROP FUNCTION IF EXISTS claim_ghost_profile;

-- Drop dependent policies first
DROP POLICY IF EXISTS "patron_collection_access" ON collections;
DROP POLICY IF EXISTS "collection_items_access" ON collection_items;

-- Remove ghost_profile_id from collections
ALTER TABLE collections
DROP COLUMN IF EXISTS ghost_profile_id;

-- Add metadata column to transactions if it doesn't exist
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create updated function to handle direct user purchases only
CREATE OR REPLACE FUNCTION add_artwork_to_collection()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process successful transactions for direct user purchases
  IF NEW.status = 'succeeded' AND NEW.buyer_id IS NOT NULL AND NEW.ghost_profile_id IS NULL THEN
    -- Get or create purchased works collection
    WITH collection_creation AS (
      INSERT INTO collections (
        name,
        description,
        patron_id,
        is_purchased,
        is_private
      )
      SELECT 
        'Purchased Works',
        'Your collection of purchased artworks',
        NEW.buyer_id,
        true,
        false
      WHERE NOT EXISTS (
        SELECT 1 FROM collections 
        WHERE patron_id = NEW.buyer_id 
        AND is_purchased = true
      )
      RETURNING id
    )
    -- Insert into collection_items
    INSERT INTO collection_items (
      collection_id,
      artwork_id,
      transaction_id,
      added_at,
      display_order,
      notes
    )
    SELECT 
      COALESCE(
        (SELECT id FROM collection_creation),
        (SELECT id FROM collections WHERE patron_id = NEW.buyer_id AND is_purchased = true)
      ),
      NEW.artwork_id,
      NEW.id,
      NEW.created_at,
      COALESCE((
        SELECT MAX(display_order) + 1 
        FROM collection_items 
        WHERE collection_id = (
          SELECT id FROM collections 
          WHERE patron_id = NEW.buyer_id 
          AND is_purchased = true
        )
      ), 0),
      'Purchased on ' || NEW.created_at::date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER transaction_add_to_collection
  AFTER INSERT OR UPDATE OF status
  ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION add_artwork_to_collection();

-- Update collection stats function to handle hybrid transaction ownership
CREATE OR REPLACE FUNCTION get_collection_stats(collection_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_value', COALESCE(SUM(t.amount_total), 0),
    'average_price', COALESCE(AVG(t.amount_total), 0),
    'unique_artists', COUNT(DISTINCT a.artist_id),
    'collection_age', EXTRACT(DAY FROM (NOW() - MIN(ci.added_at)))::integer,
    'ghost_purchases', COUNT(DISTINCT t.ghost_profile_id),
    'direct_purchases', COUNT(DISTINCT t.buyer_id)
  ) INTO result
  FROM collection_items ci
  INNER JOIN transactions t ON t.id = ci.transaction_id
  INNER JOIN artworks a ON a.id = ci.artwork_id
  WHERE ci.collection_id = $1
  AND t.status = 'succeeded';

  RETURN result;
END;
$$;

-- Add function to handle ghost profile claiming
CREATE OR REPLACE FUNCTION claim_ghost_profile(
  ghost_profile_id uuid,
  claiming_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  collection_id uuid;
BEGIN
  -- Update ghost profile
  UPDATE ghost_profiles
  SET 
    is_claimed = true,
    claimed_profile_id = claiming_user_id,
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{claimed_at}',
      to_jsonb(now()::text)
    )
  WHERE id = ghost_profile_id;

  -- Update transactions with hybrid approach
  UPDATE transactions
  SET 
    buyer_id = claiming_user_id,
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{claiming_history}',
      jsonb_build_object(
        'claimed_at', now(),
        'original_ghost_profile_id', ghost_profile_id
      )
    )
  WHERE ghost_profile_id = ghost_profile_id
  AND buyer_id IS NULL;

  -- Create purchased works collection if it doesn't exist
  INSERT INTO collections (
    name,
    description,
    patron_id,
    is_purchased,
    is_private
  )
  SELECT 
    'Purchased Works',
    'Your collection of purchased artworks',
    claiming_user_id,
    true,
    false
  WHERE NOT EXISTS (
    SELECT 1 FROM collections 
    WHERE patron_id = claiming_user_id 
    AND is_purchased = true
  )
  RETURNING id INTO collection_id;

  -- If collection already exists, get its id
  IF collection_id IS NULL THEN
    SELECT id INTO collection_id
    FROM collections
    WHERE patron_id = claiming_user_id
    AND is_purchased = true;
  END IF;

  -- Add purchased artworks to collection
  INSERT INTO collection_items (
    collection_id,
    artwork_id,
    transaction_id,
    notes,
    added_at,
    display_order
  )
  SELECT 
    collection_id,
    t.artwork_id,
    t.id,
    'Purchased on ' || t.created_at::date,
    t.created_at,
    ROW_NUMBER() OVER (ORDER BY t.created_at) - 1
  FROM transactions t
  WHERE t.ghost_profile_id = ghost_profile_id
  AND t.status = 'succeeded'
  AND t.artwork_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM collection_items 
    WHERE transaction_id = t.id
  );
END;
$$;

-- Create new RLS policies
CREATE POLICY "patron_collection_access" ON collections
FOR SELECT USING (
  patron_id = auth.uid() OR
  (NOT is_private AND patron_id IN (SELECT id FROM profiles WHERE role = 'patron'))
);

CREATE POLICY "collection_items_access" ON collection_items
FOR SELECT USING (
  collection_id IN (
    SELECT id FROM collections WHERE 
      patron_id = auth.uid() OR
      (NOT is_private AND patron_id IN (SELECT id FROM profiles WHERE role = 'patron'))
  )
);

DROP POLICY IF EXISTS "transaction_access" ON transactions;
CREATE POLICY "transaction_access" ON transactions
FOR SELECT USING (
  buyer_id = auth.uid() OR
  artist_id = auth.uid() OR
  ghost_profile_id IN (
    SELECT id FROM ghost_profiles WHERE 
      claimed_profile_id = auth.uid() OR
      email = auth.jwt()->>'email'
  )
); 