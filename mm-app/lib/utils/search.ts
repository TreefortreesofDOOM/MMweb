import { createBrowserClient } from '@/lib/supabase/client'
import { type ArtistWithCount } from '@/app/(public)/artists/artists-client'
import { ARTIST_ROLES } from '@/lib/types/custom-types'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const ARTISTS_PER_PAGE = 12

interface CacheEntry {
  data: ArtistWithCount[]
  timestamp: number
}

interface SearchParams {
  query?: string
  artistType?: string
  sortBy?: 'created_at' | 'view_count' | 'name'
  sortOrder?: 'asc' | 'desc'
  page: number
}

interface SearchResult {
  id: string
  rank: number
  full_name: string
  bio: string
  location: string
}

const cache = new Map<string, CacheEntry>()

function getCacheKey(params: SearchParams): string {
  return JSON.stringify(params)
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION
}

export async function searchArtists(params: SearchParams): Promise<{
  artists: ArtistWithCount[]
  hasMore: boolean
}> {
  const cacheKey = getCacheKey(params)
  const cachedResult = cache.get(cacheKey)

  if (cachedResult && isCacheValid(cachedResult)) {
    return {
      artists: cachedResult.data,
      hasMore: cachedResult.data.length === ARTISTS_PER_PAGE
    }
  }

  const supabase = createBrowserClient()
  const from = (params.page - 1) * ARTISTS_PER_PAGE
  const to = from + ARTISTS_PER_PAGE - 1

  let query = supabase
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
    .in('artist_type', [ARTIST_ROLES.VERIFIED, ARTIST_ROLES.EMERGING])

  // Use text search function for search queries
  if (params.query) {
    const { data: searchResults } = await supabase
      .rpc('search_profiles', { search_query: params.query })
    
    if (searchResults?.length) {
      query = query.in('id', searchResults.map((r: SearchResult) => r.id))
    } else {
      return { artists: [], hasMore: false }
    }
  }

  if (params.artistType) {
    query = query.eq('artist_type', params.artistType)
  }

  // Apply sorting
  if (params.sortBy) {
    query = query.order(params.sortBy, { 
      ascending: params.sortOrder === 'asc',
      nullsFirst: false 
    })
  } else {
    // Default sorting
    query = query
      .order('exhibition_badge', { ascending: false, nullsFirst: false })
      .order('artist_type', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
  }

  const { data, error } = await query.range(from, to)

  if (error) {
    throw new Error('Failed to fetch artists')
  }

  const artists = data.map((artist: typeof data[0]) => ({
    ...artist,
    artworks: [{ count: artist.artworks?.[0]?.count || 0 }]
  })) as ArtistWithCount[]

  // Cache the results
  cache.set(cacheKey, {
    data: artists,
    timestamp: Date.now()
  })

  return {
    artists,
    hasMore: artists.length === ARTISTS_PER_PAGE
  }
}

// Clear expired cache entries periodically
const clearExpiredCache = () => {
  const entries = Array.from(cache.entries())
  for (const [key, entry] of entries) {
    if (!isCacheValid(entry)) {
      cache.delete(key)
    }
  }
}

setInterval(clearExpiredCache, CACHE_DURATION) 