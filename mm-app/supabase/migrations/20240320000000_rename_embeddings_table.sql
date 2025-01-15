-- Drop existing policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON artwork_embeddings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON artwork_embeddings;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON artwork_embeddings;

-- Rename the embeddings table to be more explicit about the model used
ALTER TABLE artwork_embeddings RENAME TO artwork_embeddings_chatgpt;

-- Recreate policies on the renamed table
CREATE POLICY "Enable read access for all users" 
ON artwork_embeddings_chatgpt
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON artwork_embeddings_chatgpt
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" 
ON artwork_embeddings_chatgpt
FOR DELETE 
TO authenticated 
USING (true); 