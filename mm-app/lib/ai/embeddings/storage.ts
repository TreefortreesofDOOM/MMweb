import { createClient } from '@/lib/supabase/supabase-server';
import type { ArtworkEmbedding, TextEmbedding, EmbeddingProvider } from './types';

const TABLE_NAMES = {
  openai: 'artwork_embeddings',
  gemini: 'artwork_embeddings_gemini'
} as const;

export async function storeArtworkEmbedding({
  artwork_id,
  embedding_type,
  content,
  provider,
  metadata = {},
}: ArtworkEmbedding) {
  try {
    const client = await createClient();
    const tableName = TABLE_NAMES[provider];
    
    const { data, error } = await client
      .from(tableName)
      .insert({
        artwork_id,
        embedding_type,
        embedding: content,
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

export async function storeTextEmbedding({
  text_id,
  embedding_type,
  content,
  provider,
  metadata = {}
}: TextEmbedding) {
  try {
    const client = await createClient();
    const tableName = 'text_embeddings'; // We only have one text embeddings table
    
    const { data, error } = await client
      .from(tableName)
      .insert({
        text_id,
        embedding_type,
        embedding: content,
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