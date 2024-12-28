-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatar files are publicly accessible" ON storage.objects;

-- Create policies for avatar management
-- 1. Allow authenticated users to upload avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
);

-- 2. Allow authenticated users to update avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'avatars'
)
WITH CHECK (
    bucket_id = 'avatars'
);

-- 3. Allow authenticated users to delete avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'avatars'
);

-- 4. Allow public read access to all avatar files
CREATE POLICY "Avatar files are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars'); 