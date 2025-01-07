-- Drop existing views and functions
DROP VIEW IF EXISTS collection_items_with_amount;
DROP FUNCTION IF EXISTS get_collection_stats;
DROP TRIGGER IF EXISTS transaction_add_to_collection ON transactions;
DROP FUNCTION IF EXISTS add_artwork_to_collection;

-- Add unique constraint to transaction_id if it doesn't exist
DO $$ 
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'one_transaction_per_item'
    ) THEN
        ALTER TABLE collection_items 
        ADD CONSTRAINT one_transaction_per_item UNIQUE (transaction_id);
    END IF;
END $$;

-- Create a function to automatically add artwork to collection after successful transaction
CREATE OR REPLACE FUNCTION add_artwork_to_collection()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process successful transactions
  IF NEW.status = 'succeeded' THEN
    -- Insert into collection_items
    INSERT INTO collection_items (
      collection_id,
      artwork_id,
      transaction_id,
      added_at,
      display_order
    )
    SELECT 
      c.id,
      NEW.artwork_id,
      NEW.id,
      NEW.created_at,
      COALESCE((
        SELECT MAX(display_order) + 1 
        FROM collection_items 
        WHERE collection_id = c.id
      ), 0)
    FROM collections c
    WHERE c.patron_id = NEW.buyer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically add artwork to collection
CREATE TRIGGER transaction_add_to_collection
  AFTER INSERT OR UPDATE OF status
  ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION add_artwork_to_collection();

-- Recreate collection stats function to use transaction data directly
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
    'collection_age', EXTRACT(DAY FROM (NOW() - MIN(ci.added_at)))::integer
  ) INTO result
  FROM collection_items ci
  INNER JOIN transactions t ON t.id = ci.transaction_id
  INNER JOIN artworks a ON a.id = ci.artwork_id
  WHERE ci.collection_id = $1
  AND t.status = 'succeeded';

  RETURN result;
END;
$$; 