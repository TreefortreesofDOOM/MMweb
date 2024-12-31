import type { Database } from '@/lib/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Artwork = Database['public']['Tables']['artworks']['Row']
export type ArtworkEmbedding = Database['public']['Tables']['artwork_embeddings_gemini']['Row']

export interface ExtractedData {
  profiles: Profile[];
  artworks: Artwork[];
  embeddings?: ArtworkEmbedding[];
} 