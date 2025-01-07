-- Add purchased flag to collections
ALTER TABLE collections ADD COLUMN is_purchased BOOLEAN DEFAULT false;

-- Create a function to handle purchase collection management
CREATE OR REPLACE FUNCTION handle_artwork_purchase()
RETURNS TRIGGER AS $$
DECLARE
  purchase_collection_id UUID;
BEGIN
  -- Get or create the "Purchased Works" collection for this patron
  SELECT id INTO purchase_collection_id
  FROM collections
  WHERE patron_id = NEW.buyer_id 
    AND is_purchased = true
  LIMIT 1;

  IF purchase_collection_id IS NULL THEN
    INSERT INTO collections (
      name,
      description,
      patron_id,
      is_purchased,
      is_private
    ) VALUES (
      'Purchased Works',
      'Your collection of purchased artworks',
      NEW.buyer_id,
      true,
      false
    ) RETURNING id INTO purchase_collection_id;
  END IF;

  -- Add the purchased artwork to the collection
  INSERT INTO collection_items (
    collection_id,
    artwork_id,
    notes
  ) VALUES (
    purchase_collection_id,
    NEW.artwork_id,
    'Purchased on ' || NEW.created_at::date
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle purchases
CREATE TRIGGER on_artwork_purchase
  AFTER INSERT ON transactions
  FOR EACH ROW
  WHEN (NEW.status = 'succeeded')
  EXECUTE FUNCTION handle_artwork_purchase(); 