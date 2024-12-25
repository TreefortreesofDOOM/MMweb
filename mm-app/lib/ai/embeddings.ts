import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Initialize OpenAI client (we'll need to add OpenAI API key to env variables)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase credentials not found in environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

interface EmbeddingInput {
  input: string | string[];
}

interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
}

export async function generateEmbedding(text: string | string[]): Promise<number[][]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002',
      } as EmbeddingInput),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = (await response.json()) as EmbeddingResponse;
    return result.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

interface ArtworkEmbedding {
  artwork_id: string;
  embedding_type: 'description' | 'title' | 'combined';
  content: string;
  metadata?: Record<string, any>;
}

export async function storeArtworkEmbedding({
  artwork_id,
  embedding_type,
  content,
  metadata = {},
}: ArtworkEmbedding) {
  try {
    const [embedding] = await generateEmbedding(content);
    
    const { data, error } = await supabase
      .from('artwork_embeddings')
      .insert({
        artwork_id,
        embedding_type,
        embedding,
        metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error storing artwork embedding:', error);
    throw error;
  }
}

interface TextEmbedding {
  content_type: string;
  content_id: string;
  content: string;
  metadata?: Record<string, any>;
}

export async function storeTextEmbedding({
  content_type,
  content_id,
  content,
  metadata = {},
}: TextEmbedding) {
  try {
    const [embedding] = await generateEmbedding(content);
    
    const { data, error } = await supabase
      .from('text_embeddings')
      .insert({
        content_type,
        content_id,
        embedding,
        metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error storing text embedding:', error);
    throw error;
  }
}

interface SearchOptions {
  match_threshold?: number;
  match_count?: number;
}

export async function findSimilarArtworks(
  queryText: string,
  options: SearchOptions = {}
) {
  try {
    const [queryEmbedding] = await generateEmbedding(queryText);
    const {
      match_threshold = 0.7,
      match_count = 10,
    } = options;

    const { data, error } = await supabase
      .rpc('match_artworks', {
        query_embedding: queryEmbedding,
        match_threshold,
        match_count,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error finding similar artworks:', error);
    throw error;
  }
}

// Helper function to update embeddings when artwork is updated
export async function updateArtworkEmbeddings(
  artwork_id: string,
  title: string,
  description: string
) {
  try {
    // Generate embeddings for title and description
    const [titleEmbedding] = await generateEmbedding(title);
    const [descriptionEmbedding] = await generateEmbedding(description);
    const [combinedEmbedding] = await generateEmbedding(`${title} ${description}`);

    // Store all embeddings in parallel
    await Promise.all([
      storeArtworkEmbedding({
        artwork_id,
        embedding_type: 'title',
        content: title,
      }),
      storeArtworkEmbedding({
        artwork_id,
        embedding_type: 'description',
        content: description,
      }),
      storeArtworkEmbedding({
        artwork_id,
        embedding_type: 'combined',
        content: `${title} ${description}`,
      }),
    ]);
  } catch (error) {
    console.error('Error updating artwork embeddings:', error);
    throw error;
  }
} 