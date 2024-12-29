'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import { ArtistCard } from './artist-card'
import { useInView } from 'react-intersection-observer'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { ARTIST_ROLES, type ArtistRole } from '@/lib/types/custom-types'
import { searchArtists } from '@/lib/utils/search'
import { trackArtistDirectoryView } from '@/lib/actions/analytics'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/lib/hooks/use-debounce'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [artistType, setArtistType] = useState<string>('')
  const [sortBy, setSortBy] = useState<'created_at' | 'view_count' | 'name'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { toast } = useToast()
  
  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: '100px',
  })

  const debouncedSearch = useDebounce(searchQuery, 300)

  const fetchArtists = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { artists: newArtists, hasMore: moreResults } = await searchArtists({
        query: debouncedSearch,
        artistType: artistType === 'all' ? undefined : artistType,
        sortBy,
        sortOrder,
        page
      })

      setArtists(prev => page === 1 ? newArtists : [...prev, ...newArtists])
      setHasMore(moreResults)
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
  }, [debouncedSearch, artistType, sortBy, sortOrder, page, toast])

  const handleRetry = useCallback(() => {
    setPage(1)
    setArtists([])
    setHasMore(true)
    fetchArtists()
  }, [fetchArtists])

  // Handle search and filter changes
  useEffect(() => {
    setPage(1)
    setArtists([])
    setHasMore(true)
    fetchArtists()
  }, [debouncedSearch, artistType, sortBy, sortOrder, fetchArtists])

  // Handle infinite scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      fetchArtists().then(() => {
        setPage(prev => prev + 1)
      })
    }
  }, [inView, hasMore, isLoading, fetchArtists])

  // Track initial artists view
  useEffect(() => {
    trackArtistDirectoryView({
      initialCount: initialArtists.length,
      hasMore
    })
  }, [initialArtists.length, hasMore])

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
          {searchQuery ? 'No artists match your search criteria.' : 'There are no approved artists to display at this time.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder="Search artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2">
          <Select value={artistType} onValueChange={setArtistType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Artist type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value={ARTIST_ROLES.VERIFIED}>Verified</SelectItem>
              <SelectItem value={ARTIST_ROLES.EMERGING}>Emerging</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date joined</SelectItem>
              <SelectItem value="view_count">Popularity</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as typeof sortOrder)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
    </div>
  )
} 