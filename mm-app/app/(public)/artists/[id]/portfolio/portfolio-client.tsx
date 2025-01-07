'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@/lib/supabase/supabase-client'
import { PortfolioFilters } from '@/components/portfolio/portfolio-filters'
import { PortfolioSort, type PortfolioSort as PortfolioSortType } from '@/components/portfolio/portfolio-sort'
import { ArtworkGallery } from '@/components/artwork/artwork-gallery'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import type { Database } from '@/lib/types/database.types'

type DbArtwork = Database['public']['Tables']['artworks']['Row'] & {
  profiles?: {
    id: string
    full_name: string | null
    bio: string | null
    avatar_url: string | null
  } | null
}

interface GalleryArtwork {
  id: string
  title: string
  description?: string
  price: number
  status: string
  images: Array<{
    url: string
    isPrimary: boolean
    order: number
  }>
  artist?: {
    id?: string
    name?: string
    bio?: string
    avatar_url?: string
  }
  profiles?: {
    id: string
    name: string
    avatar_url: string
  }
}

interface PortfolioClientProps {
  artistId: string
  initialArtworks: DbArtwork[]
}

export function PortfolioClient({ artistId, initialArtworks }: PortfolioClientProps) {
  // Transform database artworks to gallery format
  const transformArtwork = useCallback((artwork: DbArtwork): GalleryArtwork => {
    const images = artwork.images as Array<{
      url: string
      is_primary: boolean
      order: number
    }>

    const artistData = artwork.profiles ? {
      id: artwork.profiles.id,
      name: artwork.profiles.full_name || undefined,
      bio: artwork.profiles.bio || undefined,
      avatar_url: artwork.profiles.avatar_url || undefined
    } : undefined;

    return {
      id: artwork.id,
      title: artwork.title,
      description: artwork.description || undefined,
      price: artwork.price || 0,
      status: artwork.status,
      images: images.map((img, index) => ({
        url: img.url,
        isPrimary: img.is_primary || index === 0,
        order: img.order || index
      })),
      artist: artistData,
      profiles: artwork.profiles ? {
        id: artwork.profiles.id,
        name: artwork.profiles.full_name || '',
        avatar_url: artwork.profiles.avatar_url || '',
      } : undefined
    }
  }, [])

  const [artworks, setArtworks] = useState<GalleryArtwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<PortfolioSortType>({
    field: 'display_order',
    direction: 'asc'
  })
  const { toast } = useToast()
  const supabase = createBrowserClient()

  // Initialize artworks in useEffect to avoid blocking render
  useEffect(() => {
    try {
      if (!initialArtworks) {
        setArtworks([])
        return
      }
      const transformedArtworks = initialArtworks.map(transformArtwork)
      setArtworks(transformedArtworks)
    } catch (error) {
      console.error('Error transforming initial artworks:', error)
      setError('Failed to load artworks')
    } finally {
      setIsLoading(false)
    }
  }, [initialArtworks])

  // Calculate price range from initial artworks - memoized
  const priceRange = useMemo(() => ({
    min: Math.min(...initialArtworks.map(a => a.price || 0)),
    max: Math.max(...initialArtworks.map(a => a.price || 0))
  }), [initialArtworks])

  // Get unique mediums from initial artworks - memoized
  const mediums = useMemo(() => 
    Array.from(new Set(initialArtworks.map(a => {
      const images = a.images as Array<{ medium?: string }>
      return images[0]?.medium
    }).filter(Boolean) as string[])),
    [initialArtworks]
  )

  const fetchFilteredArtworks = useCallback(async (filters: {
    search: string
    medium: string
    priceRange: [number, number]
    dateRange: [Date | null, Date | null]
  }) => {
    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from('artworks')
        .select(`
          *,
          profiles (
            id,
            full_name,
            bio,
            avatar_url
          )
        `)
        .eq('artist_id', artistId)
        .eq('status', 'published')

      // Apply filters
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      if (filters.medium) {
        const images = JSON.stringify([{ medium: filters.medium }])
        query = query.contains('images', images)
      }

      if (filters.priceRange) {
        query = query
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1])
      }

      if (filters.dateRange[0]) {
        query = query.gte('created_at', filters.dateRange[0].toISOString())
      }

      if (filters.dateRange[1]) {
        query = query.lte('created_at', filters.dateRange[1].toISOString())
      }

      // Apply sorting
      if (sort.field === 'display_order') {
        query = query.order('display_order', { ascending: sort.direction === 'asc' })
      } else if (sort.field === 'price') {
        query = query.order('price', { ascending: sort.direction === 'asc', nullsFirst: false })
      } else if (sort.field === 'created_at') {
        query = query.order('created_at', { ascending: sort.direction === 'asc' })
      } else if (sort.field === 'title') {
        query = query.order('title', { ascending: sort.direction === 'asc' })
      }

      const { data, error } = await query

      if (error) throw error

      setArtworks((data || []).map(transformArtwork))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('Error fetching artworks:', error)
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
    } finally {
      setIsLoading(false)
    }
  }, [artistId, sort, supabase, toast, transformArtwork])

  const handleRetry = useCallback(() => {
    fetchFilteredArtworks({
      search: '',
      medium: '',
      priceRange: [priceRange.min, priceRange.max],
      dateRange: [null, null]
    })
  }, [fetchFilteredArtworks, priceRange])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>{error}</p>
          <Button 
            variant="outline" 
            onClick={handleRetry}
            className="w-fit"
            aria-label="Try loading artworks again"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <PortfolioFilters
          onFilterChange={fetchFilteredArtworks}
          mediums={mediums}
          priceRange={priceRange}
        />
        <div className="flex justify-end">
          <PortfolioSort
            onSortChange={setSort}
            defaultSort={sort}
          />
        </div>
      </div>

      <div 
        role="feed" 
        aria-busy={isLoading} 
        aria-label="Artist portfolio"
        className="relative"
      >
        {artworks.length > 0 ? (
          <ArtworkGallery artworks={artworks} isLoading={isLoading} />
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>No Artworks Found</AlertTitle>
            <AlertDescription>
              No artworks match your filter criteria. Try adjusting your filters.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
} 