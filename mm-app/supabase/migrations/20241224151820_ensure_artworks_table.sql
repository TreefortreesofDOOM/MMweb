-- Drop existing table if it exists
DROP TABLE IF EXISTS public.artworks;

-- Create artwork status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE artwork_status AS ENUM ('draft', 'published', 'sold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create artworks table
CREATE TABLE IF NOT EXISTS public.artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    status artwork_status NOT NULL DEFAULT 'draft',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS artworks_artist_id_idx ON public.artworks(artist_id);
CREATE INDEX IF NOT EXISTS artworks_status_idx ON public.artworks(status);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_artworks_updated_at ON public.artworks;
CREATE TRIGGER update_artworks_updated_at
    BEFORE UPDATE ON public.artworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set up RLS policies
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Artists can view own artworks" ON public.artworks;
DROP POLICY IF EXISTS "Artists can create artworks" ON public.artworks;
DROP POLICY IF EXISTS "Artists can update own artworks" ON public.artworks;
DROP POLICY IF EXISTS "Artists can delete own artworks" ON public.artworks;
DROP POLICY IF EXISTS "Anyone can view published artworks" ON public.artworks;

-- Artists can view their own artworks
CREATE POLICY "Artists can view own artworks"
    ON public.artworks FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE id = artist_id
    ));

-- Artists can create artworks
CREATE POLICY "Artists can create artworks"
    ON public.artworks FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM public.profiles WHERE id = artist_id AND role = 'artist'
    ));

-- Artists can update their own artworks
CREATE POLICY "Artists can update own artworks"
    ON public.artworks FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE id = artist_id
    ));

-- Artists can delete their own artworks
CREATE POLICY "Artists can delete own artworks"
    ON public.artworks FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE id = artist_id
    ));

-- Anyone can view published artworks
CREATE POLICY "Anyone can view published artworks"
    ON public.artworks FOR SELECT
    USING (status = 'published');
