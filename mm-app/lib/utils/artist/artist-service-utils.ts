import { createBrowserClient } from '@/lib/supabase/supabase-client'
import type { ArtistWithCount } from '@/app/(public)/artists/artists-client'
import type { SearchParams, SearchResult, CacheEntry } from '@/lib/types/search-artist-types'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const ARTISTS_PER_PAGE = 12

export class ArtistService {
  private static instance: ArtistService
  private cache: Map<string, CacheEntry<ArtistWithCount[]>>

  private constructor() {
    this.cache = new Map()
    this.startCleanupInterval()
  }

  /**
   * Get singleton instance of ArtistService
   */
  public static getInstance(): ArtistService {
    if (!ArtistService.instance) {
      ArtistService.instance = new ArtistService()
    }
    return ArtistService.instance
  }

  /**
   * Search for artists with caching
   */
  public async searchArtists(params: SearchParams): Promise<{
    artists: ArtistWithCount[]
    hasMore: boolean
  }> {
    const cacheKey = this.getCacheKey(params)
    const cached = this.getCached(cacheKey)
    
    if (cached) {
      return {
        artists: cached,
        hasMore: cached.length === ARTISTS_PER_PAGE
      }
    }

    const { from, to } = this.getPaginationRange(params.page)
    const query = await this.buildQuery(params)
    const data = await query.execute()
    
    const artists = this.transformArtistData(data)
    this.setCache(cacheKey, artists)
    
    return {
      artists,
      hasMore: artists.length === ARTISTS_PER_PAGE
    }
  }

  /**
   * Build the database query
   */
  private async buildQuery(params: SearchParams) {
    const supabase = createBrowserClient()
    let query = supabase
      .from('profiles')
      .select(`
        id, first_name, last_name, full_name, avatar_url,
        bio, instagram, website, created_at, exhibition_badge,
        view_count, role, location, artworks!artworks_artist_id_fkey (count)
      `)

    // Add search if provided
    if (params.query) {
      const { data: searchResults } = await supabase
        .rpc('search_profiles', { search_query: params.query })
      
      if (searchResults?.length) {
        query = query.in('id', searchResults.map((r: SearchResult) => r.id))
      }
    }

    // Add artist type filter
    if (params.artistType) {
      query = query.eq('role', 
        params.artistType === 'verified' ? 'verified_artist' : 'emerging_artist'
      )
    }

    // Add sorting
    if (params.sortBy) {
      query = query.order(params.sortBy, { 
        ascending: params.sortOrder === 'asc',
        nullsFirst: false 
      })
    } else {
      query = query
        .order('role', { ascending: true, nullsFirst: false })
        .order('exhibition_badge', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
    }

    return {
      query,
      async execute() {
        const { data, error } = await query
        if (error) throw new Error('Failed to fetch artists')
        return data
      }
    }
  }

  /**
   * Cache management
   */
  private getCacheKey(params: unknown): string {
    return JSON.stringify(params)
  }

  private getCached(key: string): ArtistWithCount[] | null {
    const entry = this.cache.get(key)
    if (!entry || !this.isValidCache(entry)) return null
    return entry.data
  }

  private setCache(key: string, data: ArtistWithCount[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private isValidCache(entry: CacheEntry<ArtistWithCount[]>): boolean {
    return Date.now() - entry.timestamp < CACHE_DURATION
  }

  private cleanup(): void {
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (!this.isValidCache(entry)) {
        this.cache.delete(key)
      }
    })
  }

  private startCleanupInterval(): void {
    setInterval(() => this.cleanup(), CACHE_DURATION)
  }

  /**
   * Helper functions
   */
  private getPaginationRange(page: number): { from: number; to: number } {
    const from = (page - 1) * ARTISTS_PER_PAGE
    return {
      from,
      to: from + ARTISTS_PER_PAGE - 1
    }
  }

  private transformArtistData(data: any[]): ArtistWithCount[] {
    return data.map(artist => ({
      ...artist,
      artworks: [{ count: artist.artworks?.[0]?.count || 0 }]
    })) as ArtistWithCount[]
  }
}
