-- Create the table for Gemini embeddings (768 dimensions)
CREATE TABLE IF NOT EXISTS artwork_embeddings_gemini (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
  embedding_type text NOT NULL,
  embedding vector(768) NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for similarity search
CREATE INDEX IF NOT EXISTS artwork_embeddings_gemini_embedding_idx 
ON artwork_embeddings_gemini 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add RLS policies
ALTER TABLE artwork_embeddings_gemini ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON artwork_embeddings_gemini;
CREATE POLICY "Enable read access for all users" 
ON artwork_embeddings_gemini FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON artwork_embeddings_gemini;
CREATE POLICY "Enable insert for authenticated users only" 
ON artwork_embeddings_gemini FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON artwork_embeddings_gemini;
CREATE POLICY "Enable update for authenticated users only" 
ON artwork_embeddings_gemini FOR UPDATE 
TO authenticated 
USING (true);

-- Create function to match artworks using Gemini embeddings
CREATE OR REPLACE FUNCTION match_artworks_gemini(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10
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
    ae.id,
    ae.artwork_id,
    1 - (ae.embedding <=> query_embedding) as similarity
  FROM artwork_embeddings_gemini ae
  WHERE 1 - (ae.embedding <=> query_embedding) > match_threshold
  ORDER BY ae.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;