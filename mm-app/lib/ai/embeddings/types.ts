export type EmbeddingProvider = 'openai' | 'gemini';

export interface EmbeddingOptions {
  provider: EmbeddingProvider;
}

export interface ArtworkEmbedding {
  artwork_id: string;
  embedding_type: 'description' | 'title' | 'combined';
  content: string;
  provider: EmbeddingProvider;
  metadata?: Record<string, any>;
}

export interface TextEmbedding {
  content_type: string;
  content_id: string;
  content: string;
  provider: EmbeddingProvider;
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  match_threshold?: number;
  match_count?: number;
  provider?: EmbeddingProvider;
}

export interface SimilarityMatch {
  id: string;
  artwork_id: string;
  similarity: number;
} 