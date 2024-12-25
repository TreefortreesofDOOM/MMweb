-- Add images column to artworks table
ALTER TABLE artworks
  ADD COLUMN images JSONB NOT NULL DEFAULT '[]'::jsonb,
  DROP COLUMN image_url;

-- Add a comment to explain the structure
COMMENT ON COLUMN artworks.images IS 'Array of image objects with structure: { url: string, isPrimary: boolean, order: number }';

-- Update storage policy to allow multiple images
DROP POLICY IF EXISTS "Artists can upload artwork images" ON storage.objects;
CREATE POLICY "Artists can upload artwork images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'artwork-images' AND
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'artist'
    )
  ); 