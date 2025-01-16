'use server'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

type ArtworkEmbedding = {
  artwork_id: string
  embedding: number[]
}

type ExtractedData = {
  profiles: Database['public']['Tables']['profiles']['Row'][]
  artworks: Database['public']['Tables']['artworks']['Row'][]
  artwork_embeddings_gemini: ArtworkEmbedding[]
}

type RawEmbedding = Database['public']['Tables']['artwork_embeddings_gemini']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Artwork = Database['public']['Tables']['artworks']['Row']

export async function extractArtistData(): Promise<ExtractedData> {
  // Initialize Supabase client with environment variables
  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  // Get verified and emerging artists
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['verified_artist', 'emerging_artist'])

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    throw profilesError
  }

  if (!profiles) {
    throw new Error('No profiles found')
  }

  // Get artworks for these artists
  const { data: artworks, error: artworksError } = await supabase
    .from('artworks')
    .select('*')
    .in('artist_id', profiles.map((p: Profile) => p.id))

  if (artworksError) {
    console.error('Error fetching artworks:', artworksError)
    throw artworksError
  }

  if (!artworks) {
    throw new Error('No artworks found')
  }

  // Get artwork embeddings
  const { data: rawEmbeddings, error: embeddingsError } = await supabase
    .from('artwork_embeddings_gemini')
    .select('*')
    .in('artwork_id', artworks.map((a: Artwork) => a.id))

  if (embeddingsError) {
    console.error('Error fetching embeddings:', embeddingsError)
    throw embeddingsError
  }

  if (!rawEmbeddings) {
    throw new Error('No embeddings found')
  }

  // Transform embeddings to the correct format
  const artwork_embeddings_gemini = rawEmbeddings
    .filter((e: RawEmbedding | null): e is RawEmbedding => 
      e !== null && e.artwork_id !== null && e.embedding !== null)
    .map((e: RawEmbedding) => ({
      artwork_id: e.artwork_id!,
      embedding: JSON.parse(e.embedding)
    }))

  return {
    profiles,
    artworks,
    artwork_embeddings_gemini
  }
} 