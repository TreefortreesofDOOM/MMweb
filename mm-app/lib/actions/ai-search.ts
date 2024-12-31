'use server'

import { createClient } from '@/lib/supabase/supabase-server'
import { ARTIST_ROLES, type ArtistRole } from '@/lib/types/custom-types'
import { searchDataStore } from '@/lib/vertex-ai/vertex-client'

interface AISearchParams {
  location?: string
  mediums?: string[]
  style?: string[]
  artistType?: ArtistRole
  themes?: string[]
  customCriteria?: string
}

interface AISearchResponse {
  artists: any[]
  explanation: string
}

interface SearchResult {
  document?: {
    id?: string
  }
}

interface SearchResponse {
  results?: SearchResult[]
  summary?: {
    summary_text?: string
  }
}

export async function aiArtistSearch(query: string): Promise<AISearchResponse> {
  console.log('Starting AI artist search with query:', query)
  const supabase = await createClient()
  
  try {
    // Send query to Vertex AI Search
    console.log('Sending query to Vertex AI Search:', query)
    const response = await searchDataStore('mm-web-ggl-ai-search_1735538696001', query) as SearchResponse
    console.log('Vertex AI Search response:', response)
    
    if (!response.results?.length) {
      console.log('No results found in search response')
      return {
        artists: [],
        explanation: 'No matching artists found.'
      }
    }

    // Extract artist IDs from search results
    const artistIds = response.results
      .map(result => result.document?.id)
      .filter((id): id is string => id?.startsWith('artist-') ?? false)
      .map(id => id.replace('artist-', ''))

    console.log('Extracted artist IDs:', artistIds)

    if (!artistIds.length) {
      console.log('No valid artist IDs found in results')
      return {
        artists: [],
        explanation: 'No matching artists found.'
      }
    }

    // Get full artist details from database
    console.log('Fetching artist details from Supabase')
    const { data: artists, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        full_name,
        avatar_url,
        bio,
        instagram,
        website,
        created_at,
        exhibition_badge,
        view_count,
        artist_type,
        location,
        artworks (count)
      `)
      .in('id', artistIds)
      // Only show verified or emerging artists
      .in('artist_type', [ARTIST_ROLES.VERIFIED, ARTIST_ROLES.EMERGING])

    if (error) {
      console.error('Error fetching artist details:', error)
      throw error
    }

    console.log('Found artists:', artists)

    // Sort artists based on search result order
    const sortedArtists = artistIds
      .map(id => artists?.find(artist => artist.id === id))
      .filter(Boolean)

    console.log('Sorted artists:', sortedArtists)

    return {
      artists: sortedArtists || [],
      explanation: response.summary?.summary_text || 'Found matching artists based on your search.'
    }
  } catch (error) {
    console.error('Error in AI search:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    throw error
  }
} 