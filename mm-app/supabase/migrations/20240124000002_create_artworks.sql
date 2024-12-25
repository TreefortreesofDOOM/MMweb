-- Create artwork status enum
CREATE TYPE artwork_status AS ENUM ('draft', 'published', 'sold');

-- Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    status artwork_status NOT NULL DEFAULT 'draft',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS artworks_artist_id_idx ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS artworks_status_idx ON artworks(status);

-- Add trigger for updated_at
CREATE TRIGGER update_artworks_updated_at
    BEFORE UPDATE ON artworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set up RLS policies
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Artists can view their own artworks
CREATE POLICY "Artists can view own artworks"
    ON artworks FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE id = artist_id
    ));

-- Artists can create artworks
CREATE POLICY "Artists can create artworks"
    ON artworks FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM profiles WHERE id = artist_id AND role = 'artist'
    ));

-- Artists can update their own artworks
CREATE POLICY "Artists can update own artworks"
    ON artworks FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE id = artist_id
    ));

-- Artists can delete their own artworks
CREATE POLICY "Artists can delete own artworks"
    ON artworks FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE id = artist_id
    ));

-- Anyone can view published artworks
CREATE POLICY "Anyone can view published artworks"
    ON artworks FOR SELECT
    USING (status = 'published'); 