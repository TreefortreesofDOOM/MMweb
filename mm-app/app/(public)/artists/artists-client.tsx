'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArtistCard } from './artist-card'
import { useInView } from 'react-intersection-observer'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { ARTIST_ROLES, type ArtistRole, type Profile } from '@/lib/types/custom-types'
import type { Database } from '@/lib/database.types'

const ARTISTS_PER_PAGE = 12

interface DbArtist {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  instagram: string | null;
  website: string | null;
  created_at: string;
  exhibition_badge: boolean | null;
  view_count: number | null;
  artist_type: string | null;
  artworks: { count: number }[];
  location: string | null;
}

export type ArtistWithCount = Omit<DbArtist, 'artist_type'> & {
  artist_type?: ArtistRole;
  artworks: [{ count: number }];
}

interface ArtistsClientProps {
  initialArtists: ArtistWithCount[];
}

export function ArtistsClient({ initialArtists }: ArtistsClientProps) {
  const [artists, setArtists] = useState<ArtistWithCount[]>(() => 
    initialArtists.map(artist => ({
      ...artist,
      artist_type: artist.artist_type as ArtistRole,
      artworks: [{ count: artist.artworks?.[0]?.count || 0 }]
    }))
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(2) // Start from page 2 since we have initial data
  const [hasMore, setHasMore] = useState(initialArtists.length === ARTISTS_PER_PAGE)
  const supabase = createClient()
  const { toast } = useToast()
  
  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: '100px',
  })

  const fetchArtists = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const from = (page - 1) * ARTISTS_PER_PAGE
      const to = from + ARTISTS_PER_PAGE - 1

      const { data, error } = await supabase
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
          artworks:artworks(count)
        `)
        .in('artist_type', [ARTIST_ROLES.VERIFIED, ARTIST_ROLES.EMERGING])
        .order('artist_type', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        throw new Error('Failed to fetch artists')
      }

      if (data) {
        const artistsWithCount = data.map(artist => ({
          ...artist,
          artworks: [{ count: artist.artworks?.[0]?.count || 0 }]
        })) as ArtistWithCount[]

        setArtists(prev => [...prev, ...artistsWithCount])
        setHasMore(data.length === ARTISTS_PER_PAGE)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('Error fetching artists:', error)
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, page, toast])

  const handleRetry = useCallback(() => {
    setPage(2) // Reset to page 2 since we have initial data
    setArtists(initialArtists)
    setHasMore(initialArtists.length === ARTISTS_PER_PAGE)
    fetchArtists()
  }, [fetchArtists, initialArtists])

  useEffect(() => {
    if (inView && hasMore && !isLoading && !error) {
      setPage(prev => prev + 1)
    }
  }, [inView, hasMore, isLoading, error])

  useEffect(() => {
    if (page > 2) { // Only fetch if we're past the initial data
      fetchArtists()
    }
  }, [page, fetchArtists])

  const artistGrid = useMemo(() => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {artists.map((artist, index) => (
        <ArtistCard 
          key={artist.id} 
          artist={artist} 
          index={index}
          totalArtists={artists.length}
        />
      ))}
    </div>
  ), [artists])

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
            aria-label="Try loading artists again"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!artists.length && !isLoading) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>No Artists Found</AlertTitle>
        <AlertDescription>
          There are no approved artists to display at this time.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div 
      role="feed" 
      aria-busy={isLoading} 
      aria-label="Artist directory"
      className="space-y-8"
    >
      {artistGrid}
      
      {hasMore && !error && (
        <div 
          ref={ref} 
          className="flex justify-center p-4" 
          aria-label={isLoading ? "Loading more artists" : "Load more artists when scrolled into view"}
        >
          {isLoading && (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  )
} 