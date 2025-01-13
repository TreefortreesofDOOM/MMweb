-- Add price constraints to store_products
ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS is_variable_price BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS min_price DECIMAL,
  ADD COLUMN IF NOT EXISTS recommended_price DECIMAL,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add price rules constraint
ALTER TABLE store_products
  ADD CONSTRAINT price_rules 
  CHECK (
    (is_variable_price = true AND min_price IS NOT NULL) OR
    (is_variable_price = false AND gallery_price IS NOT NULL)
  );

-- Add RLS policies for price access
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view store product prices"
  ON store_products
  FOR SELECT
  USING (true);

CREATE POLICY "Artists can update their store product prices"
  ON store_products
  FOR UPDATE
  USING (
    artwork_id IN (
      SELECT id FROM artworks 
      WHERE artist_id = auth.uid()
    )
  )
  WITH CHECK (
    artwork_id IN (
      SELECT id FROM artworks 
      WHERE artist_id = auth.uid()
    )
  ); 