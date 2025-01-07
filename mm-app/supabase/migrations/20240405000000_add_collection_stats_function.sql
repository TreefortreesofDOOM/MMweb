-- Create function to calculate collection stats
CREATE OR REPLACE FUNCTION get_collection_stats(collection_id UUID)
RETURNS TABLE (
  total_value DECIMAL,
  average_price DECIMAL,
  unique_artists INTEGER,
  collection_age INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      c.created_at,
      COUNT(DISTINCT a.artist_id) as unique_artists,
      SUM(a.price) as total_value,
      COUNT(ci.artwork_id) as artwork_count
    FROM collections c
    LEFT JOIN collection_items ci ON ci.collection_id = c.id
    LEFT JOIN artworks a ON a.id = ci.artwork_id
    WHERE c.id = collection_id
    GROUP BY c.created_at
  )
  SELECT 
    COALESCE(total_value, 0),
    CASE WHEN artwork_count > 0 THEN total_value / artwork_count ELSE 0 END,
    COALESCE(unique_artists, 0),
    EXTRACT(DAY FROM NOW() - created_at)::INTEGER
  FROM stats;
END;
$$ LANGUAGE plpgsql; 