-- Add RPC function for moving collection items
CREATE OR REPLACE FUNCTION move_collection_items(
  p_source_collection_id uuid,
  p_target_collection_id uuid,
  p_artwork_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert items into target collection
  INSERT INTO collection_items (collection_id, artwork_id)
  SELECT p_target_collection_id, unnest(p_artwork_ids);

  -- Remove items from source collection
  DELETE FROM collection_items
  WHERE collection_id = p_source_collection_id
  AND artwork_id = ANY(p_artwork_ids);
END;
$$; 