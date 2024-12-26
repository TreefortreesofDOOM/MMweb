-- Add new metadata fields to artworks table
ALTER TABLE artworks
ADD COLUMN styles text[] DEFAULT '{}',
ADD COLUMN techniques text[] DEFAULT '{}',
ADD COLUMN keywords text[] DEFAULT '{}'; 