-- Ensure artwork-images bucket exists and is properly configured
DO $$ 
BEGIN
    -- Create the bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('artwork-images', 'artwork-images', true)
    ON CONFLICT (id) DO UPDATE 
    SET name = EXCLUDED.name,
        public = EXCLUDED.public;

    -- Ensure RLS is enabled
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Artists can upload artwork images" ON storage.objects;
    DROP POLICY IF EXISTS "Artists can update own artwork images" ON storage.objects;
    DROP POLICY IF EXISTS "Artists can delete own artwork images" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view artwork images" ON storage.objects;

    -- Recreate policies
    CREATE POLICY "Artists can upload artwork images"
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = 'artwork-images' AND
            auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'artist'
            )
        );

    CREATE POLICY "Artists can update own artwork images"
        ON storage.objects FOR UPDATE
        USING (
            bucket_id = 'artwork-images' AND
            auth.uid() = owner
        );

    CREATE POLICY "Artists can delete own artwork images"
        ON storage.objects FOR DELETE
        USING (
            bucket_id = 'artwork-images' AND
            auth.uid() = owner
        );

    CREATE POLICY "Anyone can view artwork images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'artwork-images');
END $$;
