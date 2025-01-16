export type EmbeddingProvider = 'openai' | 'gemini';

export type EmbeddingType = 
  | 'title'
  | 'description'
  | 'tags'
  | 'alt_texts'
  | 'title_description'
  | 'title_tags'
  | 'all_text'
  | 'ai_content'
  | 'metadata';

export interface EmbeddingOptions {
  provider: EmbeddingProvider;
}

export interface ArtworkEmbedding {
  artwork_id: string;
  embedding_type: EmbeddingType;
  content: string;
  provider: EmbeddingProvider;
  metadata?: Record<string, any>;
}

export interface TextEmbedding {
  text_id: string;
  embedding_type: EmbeddingType;
  content: string;
  provider: EmbeddingProvider;
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  provider?: EmbeddingProvider;
  match_threshold?: number;
  match_count?: number;
  embedding_type?: EmbeddingType;
}

export interface SimilarityMatch {
  id: string;
  similarity: number;
} 