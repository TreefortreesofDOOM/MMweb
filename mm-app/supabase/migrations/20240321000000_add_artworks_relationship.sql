-- Add foreign key constraint if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'artworks_artist_id_fkey'
    ) THEN
        ALTER TABLE artworks
        ADD CONSTRAINT artworks_artist_id_fkey
        FOREIGN KEY (artist_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$; 