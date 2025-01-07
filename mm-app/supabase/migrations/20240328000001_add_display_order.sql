-- Add display_order column to collection_items
ALTER TABLE collection_items ADD COLUMN display_order INTEGER DEFAULT 0;

-- Create index for better performance when sorting
CREATE INDEX idx_collection_items_display_order ON collection_items(collection_id, display_order);

-- Update existing items to have sequential order
WITH ordered_items AS (
  SELECT 
    collection_id,
    artwork_id,
    ROW_NUMBER() OVER (PARTITION BY collection_id ORDER BY added_at) - 1 as new_order
  FROM collection_items
)
UPDATE collection_items ci
SET display_order = oi.new_order
FROM ordered_items oi
WHERE ci.collection_id = oi.collection_id 
  AND ci.artwork_id = oi.artwork_id; 