-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_collection_stats;

-- Recreate the function with fixed return type
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
      a.price,
      a.artist_id,
      c.created_at
    FROM collection_items ci
    INNER JOIN artworks a ON ci.artwork_id = a.id
    INNER JOIN collections c ON ci.collection_id = c.id
    WHERE ci.collection_id = $1
  )
  SELECT jsonb_build_object(
    'total_value', COALESCE(SUM(cd.price), 0),
    'average_price', COALESCE(AVG(cd.price), 0),
    'unique_artists', COUNT(DISTINCT cd.artist_id),
    'collection_age', EXTRACT(DAY FROM (NOW() - MIN(cd.created_at)))::integer
  ) INTO result
  FROM collection_data cd;

  RETURN result;
END;
$$; 