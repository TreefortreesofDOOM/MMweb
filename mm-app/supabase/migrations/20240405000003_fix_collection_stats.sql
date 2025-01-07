-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_collection_stats;

-- Recreate the function with fixed column references
CREATE OR REPLACE FUNCTION get_collection_stats(collection_id uuid)
RETURNS TABLE (
  total_value numeric,
  average_price numeric,
  unique_artists integer,
  collection_age integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
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
  SELECT
    COALESCE(SUM(cd.price), 0) as total_value,
    COALESCE(AVG(cd.price), 0) as average_price,
    COUNT(DISTINCT cd.artist_id) as unique_artists,
    EXTRACT(DAY FROM (NOW() - MIN(cd.created_at)))::integer as collection_age
  FROM collection_data cd;
END;
$$; 