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
  SimilarityMatch,
  EmbeddingType
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

interface ArtworkEmbeddingInput {
  artwork_id: string;
  title: string;
  description: string;
  tags?: string[];
  alt_texts?: string[];
  ai_context?: any;
  ai_metadata?: any;
  status?: string;
  artist_id?: string;
  provider?: EmbeddingProvider;
}

// Helper function to update embeddings when artwork is updated
export async function updateArtworkEmbeddings({
  artwork_id,
  title,
  description,
  tags = [],
  alt_texts = [],
  ai_context,
  ai_metadata,
  status = 'draft',
  artist_id,
  provider = 'openai'
}: ArtworkEmbeddingInput) {
  try {
    // Generate individual embeddings
    const embeddings = await Promise.all([
      // Core content embeddings
      generateEmbedding(title, { provider }).then(([e]) => ({ type: 'title', content: e })),
      generateEmbedding(description, { provider }).then(([e]) => ({ type: 'description', content: e })),
      generateEmbedding(tags.join(' '), { provider }).then(([e]) => ({ type: 'tags', content: e })),
      generateEmbedding(alt_texts.join(' '), { provider }).then(([e]) => ({ type: 'alt_texts', content: e })),
      
      // Combined content embeddings for different search scenarios
      generateEmbedding(`${title} ${description}`, { provider })
        .then(([e]) => ({ type: 'title_description', content: e })),
      generateEmbedding(`${title} ${tags.join(' ')}`, { provider })
        .then(([e]) => ({ type: 'title_tags', content: e })),
      generateEmbedding(`${title} ${description} ${tags.join(' ')} ${alt_texts.join(' ')}`, { provider })
        .then(([e]) => ({ type: 'all_text', content: e })),
      
      // AI-specific content embedding if available
      ...(ai_context || ai_metadata ? [
        generateEmbedding(
          JSON.stringify({ context: ai_context, metadata: ai_metadata }), 
          { provider }
        ).then(([e]) => ({ type: 'ai_content', content: e }))
      ] : []),
      
      // Status and metadata embedding
      generateEmbedding(
        JSON.stringify({ status, artist_id }), 
        { provider }
      ).then(([e]) => ({ type: 'metadata', content: e }))
    ]);

    // Store all embeddings in parallel
    await Promise.all(
      embeddings.map(({ type, content }) =>
        storeArtworkEmbedding({
          artwork_id,
          embedding_type: type as EmbeddingType,
          content: JSON.stringify(content),
          provider,
        })
      )
    );
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