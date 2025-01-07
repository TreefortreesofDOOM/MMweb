-- Drop the view if it exists
DROP VIEW IF EXISTS collection_items_with_amount;

-- Create a view that includes amount paid from transactions
CREATE VIEW collection_items_with_amount AS
WITH latest_transactions AS (
  SELECT DISTINCT ON (artwork_id)
    artwork_id,
    amount_total as amount_paid
  FROM transactions
  WHERE status = 'succeeded'
  ORDER BY artwork_id, created_at DESC
)
SELECT 
    ci.artwork_id,
    ci.collection_id,
    ci.notes,
    ci.added_at,
    ci.display_order,
    lt.amount_paid
FROM collection_items ci
LEFT JOIN latest_transactions lt ON lt.artwork_id = ci.artwork_id;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_collection_stats;

-- Recreate the function to use the new view
CREATE OR REPLACE FUNCTION get_collection_stats(collection_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH collection_data AS (
    SELECT 
      ci.collection_id,
      ci.amount_paid,
      a.artist_id,
      c.created_at
    FROM collection_items_with_amount ci
    INNER JOIN artworks a ON ci.artwork_id = a.id
    INNER JOIN collections c ON ci.collection_id = c.id
    WHERE ci.collection_id = $1
  )
  SELECT jsonb_build_object(
    'total_value', COALESCE(SUM(cd.amount_paid), 0),
    'average_price', COALESCE(AVG(cd.amount_paid), 0),
    'unique_artists', COUNT(DISTINCT cd.artist_id),
    'collection_age', EXTRACT(DAY FROM (NOW() - MIN(cd.created_at)))::integer
  ) INTO result
  FROM collection_data cd;

  RETURN result;
END;
$$; 