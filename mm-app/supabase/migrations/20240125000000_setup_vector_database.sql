-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables for different types of embeddings
CREATE TABLE artwork_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    embedding vector(1536),  -- OpenAI's text-embedding-ada-002 uses 1536 dimensions
    embedding_type TEXT NOT NULL, -- 'description', 'title', 'combined'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE text_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type TEXT NOT NULL, -- 'artist_statement', 'artwork_description', etc.
    content_id UUID NOT NULL,   -- Reference to the source content
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster similarity search
CREATE INDEX ON artwork_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);  -- Number of lists affects speed vs accuracy trade-off

CREATE INDEX ON text_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create indexes for foreign keys and common queries
CREATE INDEX artwork_embeddings_artwork_id_idx ON artwork_embeddings(artwork_id);
CREATE INDEX artwork_embeddings_type_idx ON artwork_embeddings(embedding_type);
CREATE INDEX text_embeddings_content_type_idx ON text_embeddings(content_type);
CREATE INDEX text_embeddings_content_id_idx ON text_embeddings(content_id);

-- Enable RLS
ALTER TABLE artwork_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artwork_embeddings
CREATE POLICY "Anyone can view artwork embeddings for published artworks"
    ON artwork_embeddings FOR SELECT
    USING (
        artwork_id IN (
            SELECT id FROM artworks WHERE status = 'published'
        )
    );

CREATE POLICY "Artists can view own artwork embeddings"
    ON artwork_embeddings FOR SELECT
    USING (
        artwork_id IN (
            SELECT id FROM artworks WHERE artist_id = auth.uid()
        )
    );

CREATE POLICY "System can manage artwork embeddings"
    ON artwork_embeddings
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- RLS Policies for text_embeddings
CREATE POLICY "Anyone can view public text embeddings"
    ON text_embeddings FOR SELECT
    USING (
        content_type IN ('public_content', 'artwork_description')
    );

CREATE POLICY "Users can view own text embeddings"
    ON text_embeddings FOR SELECT
    USING (
        content_id::text = auth.uid()::text
        OR content_id IN (
            SELECT id FROM artworks WHERE artist_id = auth.uid()
        )
    );

CREATE POLICY "System can manage text embeddings"
    ON text_embeddings
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Add triggers for updated_at
CREATE TRIGGER update_artwork_embeddings_updated_at
    BEFORE UPDATE ON artwork_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_text_embeddings_updated_at
    BEFORE UPDATE ON text_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helper functions for similarity search
CREATE OR REPLACE FUNCTION match_artworks(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id uuid,
    artwork_id uuid,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        artwork_embeddings.id,
        artwork_embeddings.artwork_id,
        1 - (artwork_embeddings.embedding <=> query_embedding) AS similarity
    FROM artwork_embeddings
    WHERE 1 - (artwork_embeddings.embedding <=> query_embedding) > match_threshold
    ORDER BY artwork_embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$; 