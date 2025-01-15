import { generateChatGPTEmbedding } from './chatgpt';
import { generateGeminiEmbedding } from './gemini';
import { storeArtworkEmbedding, storeTextEmbedding } from './storage';
import { createClient } from '@/lib/supabase/supabase-server';
import type { 
  EmbeddingProvider, 
  EmbeddingOptions, 
  ArtworkEmbedding, 
  TextEmbedding,
  SearchOptions,
  SimilarityMatch
} from './types';

export async function generateEmbedding(
  text: string | string[],
  options: EmbeddingOptions
): Promise<number[][]> {
  return options.provider === 'openai' 
    ? generateChatGPTEmbedding(text)
    : generateGeminiEmbedding(text);
}

export async function findSimilarArtworks(
  queryText: string,
  options: SearchOptions = {}
): Promise<SimilarityMatch[]> {
  try {
    const provider = options.provider || 'openai';
    const embedding = await generateEmbedding(queryText, { provider });
    const {
      match_threshold = 0.7,
      match_count = 10,
    } = options;

    const client = await createClient();
    const functionName = provider === 'openai' ? 'match_artworks' : 'match_artworks_gemini';
    const { data, error } = await client.rpc(functionName, {
      query_embedding: `[${embedding[0].join(',')}]`,
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
  description: string,
  provider: EmbeddingProvider = 'openai'
) {
  try {
    // Generate embeddings for title and description
    const [titleEmbedding] = await generateEmbedding(title, { provider });
    const [descriptionEmbedding] = await generateEmbedding(description, { provider });
    const [combinedEmbedding] = await generateEmbedding(`${title} ${description}`, { provider });

    // Store all embeddings in parallel
    await Promise.all([
      storeArtworkEmbedding({
        artwork_id,
        embedding_type: 'title',
        content: JSON.stringify(titleEmbedding),
        provider,
      }),
      storeArtworkEmbedding({
        artwork_id,
        embedding_type: 'description',
        content: JSON.stringify(descriptionEmbedding),
        provider,
      }),
      storeArtworkEmbedding({
        artwork_id,
        embedding_type: 'combined',
        content: JSON.stringify(combinedEmbedding),
        provider,
      }),
    ]);
  } catch (error) {
    console.error('Error updating artwork embeddings:', error);
    throw error;
  }
}

export type { 
  EmbeddingProvider, 
  EmbeddingOptions, 
  ArtworkEmbedding, 
  TextEmbedding,
  SearchOptions,
  SimilarityMatch
}; 