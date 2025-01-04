import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database.types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize clients lazily
let genAI: GoogleGenerativeAI | null = null;
let supabase: ReturnType<typeof createClient<Database>> | null = null;

// Initialize Gemini AI with more detailed error handling
function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Gemini API key in environment variables (GOOGLE_AI_API_KEY)');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// Initialize Supabase with more detailed error handling
function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials in environment variables');
    }
    
    supabase = createClient<Database>(url, key);
  }
  return supabase;
}

export async function generateEmbedding(text: string | string[]): Promise<number[][]> {
  // Return placeholder embeddings
  const placeholderEmbedding = new Array(768).fill(0);
  return Array.isArray(text) ? text.map(() => placeholderEmbedding) : [placeholderEmbedding];
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
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("artwork_embeddings_gemini")
      .insert({
        artwork_id,
        embedding_type,
        embedding: JSON.stringify(embedding),
        metadata
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
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("text_embeddings")
      .insert({
        content_type,
        content_id,
        embedding: JSON.stringify(embedding),
        metadata
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
    const client = getSupabaseClient();
    const { data, error } = await client.rpc("match_artworks_gemini", {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold,
      match_count
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