-- Update artworks table to support multiple image URLs
ALTER TABLE artworks 
  ADD COLUMN image_urls TEXT[] NOT NULL DEFAULT '{}',
  DROP COLUMN image_url;

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

DROP POLICY IF EXISTS "Artists can update their artwork images" ON storage.objects;
CREATE POLICY "Artists can update their artwork images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'artwork-images' AND
    auth.uid() = owner
  )
  WITH CHECK (
    bucket_id = 'artwork-images' AND
    auth.uid() = owner
  );

DROP POLICY IF EXISTS "Artists can delete their artwork images" ON storage.objects;
CREATE POLICY "Artists can delete their artwork images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'artwork-images' AND
    auth.uid() = owner
  );

DROP POLICY IF EXISTS "Anyone can view artwork images" ON storage.objects;
CREATE POLICY "Anyone can view artwork images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'artwork-images'
  ); 