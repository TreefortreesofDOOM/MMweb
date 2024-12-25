-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access to Buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Public Access to Objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Can Upload Objects" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Update Own Objects" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Delete Own Objects" ON storage.objects;

-- Create policies for storage.buckets
CREATE POLICY "Public Access to Buckets"
  ON storage.buckets FOR SELECT
  USING (true);

-- Create policies for storage.objects
CREATE POLICY "Public Access to Objects"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artwork-images');

CREATE POLICY "Authenticated Users Can Upload Objects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'artwork-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users Can Update Own Objects"
  ON storage.objects FOR UPDATE
  USING (auth.uid() = owner)
  WITH CHECK (bucket_id = 'artwork-images');

CREATE POLICY "Users Can Delete Own Objects"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'artwork-images'
    AND auth.uid() = owner
  );
