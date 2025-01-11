-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create wall types enum
DO $$ BEGIN
    CREATE TYPE gallery_wall_type AS ENUM (
        'trust_wall',
        'collectors_wall',
        'added_value_pedestal',
        'featured_work'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add gallery fields to artworks table
ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS gallery_wall_type gallery_wall_type,
ADD COLUMN IF NOT EXISTS gallery_price decimal,
ADD COLUMN IF NOT EXISTS gallery_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS gallery_approved_by uuid REFERENCES profiles(id);

-- Create gallery shows table
CREATE TABLE IF NOT EXISTS gallery_shows (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_by uuid REFERENCES profiles(id),
    approved_by uuid REFERENCES profiles(id),
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Create junction table for shows and artworks
CREATE TABLE IF NOT EXISTS gallery_show_artworks (
    show_id uuid REFERENCES gallery_shows(id) ON DELETE CASCADE,
    artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
    PRIMARY KEY (show_id, artwork_id)
);

-- Create calendar availability table
CREATE TABLE IF NOT EXISTS gallery_dates (
    date date PRIMARY KEY,
    is_available boolean DEFAULT true,
    updated_by uuid REFERENCES profiles(id),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_gallery_shows_dates ON gallery_shows(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_gallery_shows_status ON gallery_shows(status);
CREATE INDEX IF NOT EXISTS idx_gallery_shows_created_by ON gallery_shows(created_by);

-- Enable RLS
ALTER TABLE gallery_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_show_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_dates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY artist_gallery_shows ON gallery_shows
    FOR ALL
    TO authenticated
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('artist', 'verified_artist')
            AND profiles.exhibition_badge = true
        )
    );

CREATE POLICY admin_gallery_manage ON gallery_shows
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY artist_show_artworks ON gallery_show_artworks
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM gallery_shows
            WHERE gallery_shows.id = gallery_show_artworks.show_id
            AND (
                gallery_shows.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('artist', 'verified_artist')
                    AND profiles.exhibition_badge = true
                )
            )
        )
    );

CREATE POLICY admin_show_artworks ON gallery_show_artworks
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY admin_dates ON gallery_dates
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY view_dates ON gallery_dates
    FOR SELECT
    TO authenticated
    USING (true);

-- Add updated_at trigger to gallery_shows
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON gallery_shows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Down Migration
/*
-- Drop triggers
DROP TRIGGER IF EXISTS set_updated_at ON gallery_shows;

-- Drop policies
DROP POLICY IF EXISTS artist_gallery_shows ON gallery_shows;
DROP POLICY IF EXISTS admin_gallery_manage ON gallery_shows;
DROP POLICY IF EXISTS artist_show_artworks ON gallery_show_artworks;
DROP POLICY IF EXISTS admin_show_artworks ON gallery_show_artworks;
DROP POLICY IF EXISTS admin_dates ON gallery_dates;
DROP POLICY IF EXISTS view_dates ON gallery_dates;

-- Drop indexes
DROP INDEX IF EXISTS idx_gallery_shows_dates;
DROP INDEX IF EXISTS idx_gallery_shows_status;
DROP INDEX IF EXISTS idx_gallery_shows_created_by;

-- Drop tables
DROP TABLE IF EXISTS gallery_show_artworks;
DROP TABLE IF EXISTS gallery_dates;
DROP TABLE IF EXISTS gallery_shows;

-- Remove gallery columns from artworks
ALTER TABLE artworks
DROP COLUMN IF EXISTS gallery_wall_type,
DROP COLUMN IF EXISTS gallery_price,
DROP COLUMN IF EXISTS gallery_approved_at,
DROP COLUMN IF EXISTS gallery_approved_by;

-- Drop enum
DROP TYPE IF EXISTS gallery_wall_type;
*/ 