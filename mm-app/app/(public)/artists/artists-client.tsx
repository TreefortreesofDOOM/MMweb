'use client'

import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
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
import dynamic from 'next/dynamic'

// Create a client-only search form component
const SearchForm = dynamic(() => Promise.resolve(({ 
  searchQuery, 
  setSearchQuery, 
  artistType, 
  setArtistType,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder 
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  artistType: string;
  setArtistType: (value: string) => void;
  sortBy: 'created_at' | 'view_count' | 'name';
  setSortBy: (value: 'created_at' | 'view_count' | 'name') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}) => (
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
)), { ssr: false })

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
  role: string;
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
  // Remove console.log for mounting
  
  // Use refs to track initialization and prevent duplicate effects
  const initRef = useRef(false);
  const fetchingRef = useRef(false);
  const currentPageRef = useRef(2); // Track current page in a ref

  const [artists, setArtists] = useState<ArtistWithCount[]>(() => 
    initialArtists.map(artist => ({
      ...artist,
      artist_type: artist.artist_type as ArtistRole,
      artworks: [{ count: artist.artworks?.[0]?.count || 0 }]
    }))
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    if (fetchingRef.current) return false;
    
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      const { artists: newArtists, hasMore: moreResults } = await searchArtists({
        query: debouncedSearch,
        artistType: artistType === 'all' ? undefined : artistType,
        sortBy,
        sortOrder,
        page: currentPageRef.current
      })

      setArtists(prev => {
        // Create a Set of existing artist IDs for O(1) lookup
        const existingIds = new Set(prev.map(artist => artist.id));
        
        console.log('State update:', {
          currentPage: currentPageRef.current,
          existingArtists: prev.length,
          newArtists: newArtists.length,
          existingIds: Array.from(existingIds),
        });
        
        // Filter out any artists we've already rendered
        const uniqueNewArtists = newArtists.filter(artist => !existingIds.has(artist.id));
        
        // Sort unique artists to maintain consistent order
        uniqueNewArtists.sort((a, b) => {
          // First sort by role (verified first)
          if (a.role !== b.role) {
            // Verified should come before emerging
            return a.role === 'verified_artist' ? -1 : 1;
          }
          // Then by exhibition badge
          if (a.exhibition_badge !== b.exhibition_badge) {
            return (b.exhibition_badge ? 1 : 0) - (a.exhibition_badge ? 1 : 0);
          }
          // Then by created date
          if (a.created_at !== b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          // Finally by ID for consistency
          return a.id.localeCompare(b.id);
        });
        
        console.log('Sorted unique new artists:', uniqueNewArtists.map(a => ({
          name: a.full_name,
          role: a.role,
          exhibition_badge: a.exhibition_badge,
          created_at: a.created_at,
          id: a.id
        })));
        
        // If we're on page 1, return just the new artists
        // Otherwise append unique new artists to existing ones
        const updatedArtists = currentPageRef.current === 1 ? newArtists : [...prev, ...uniqueNewArtists];
        
        // Update hasMore based on whether we found any unique artists
        setHasMore(moreResults && uniqueNewArtists.length > 0);
        
        // Update page number if we found unique artists
        if (moreResults && uniqueNewArtists.length > 0) {
          currentPageRef.current += 1;
        }
        
        return updatedArtists;
      });
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('Error fetching artists:', error)
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
      return false;
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
  }, [debouncedSearch, artistType, sortBy, sortOrder, toast])

  const handleRetry = useCallback(() => {
    currentPageRef.current = 1;
    setArtists([])
    setHasMore(true)
    fetchArtists()
  }, [fetchArtists])

  // Handle search and filter changes
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      return;
    }

    const hasFilters = searchQuery || artistType || sortBy !== 'created_at' || sortOrder !== 'desc'
    
    if (!hasFilters) {
      // Reset to initial state if no filters
      setArtists(initialArtists.map(artist => ({
        ...artist,
        artist_type: artist.artist_type as ArtistRole,
        artworks: [{ count: artist.artworks?.[0]?.count || 0 }]
      })))
      currentPageRef.current = 2;
      setHasMore(initialArtists.length === ARTISTS_PER_PAGE)
      return;
    }

    currentPageRef.current = 1;
    setArtists([])
    setHasMore(true)
    fetchArtists()
  }, [debouncedSearch, artistType, sortBy, sortOrder, fetchArtists, initialArtists])

  // Handle infinite scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading && !fetchingRef.current) {
      fetchArtists();
    }
  }, [inView, hasMore, isLoading, fetchArtists]);

  // Track initial artists view - with strict mode protection
  const viewTracked = useRef(false);
  useEffect(() => {
    if (!viewTracked.current) {
      viewTracked.current = true;
      trackArtistDirectoryView({
        initialCount: initialArtists.length,
        hasMore
      });
    }
  }, [initialArtists.length, hasMore]);

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

  // Keep the handleAISearch function but comment it out for future use
  /*
  const handleAISearch = async (query: string) => {
    try {
      setIsAISearching(true)
      setError(null)

      const { artists: aiArtists, explanation } = await aiArtistSearch(query)
      setAIExplanation(explanation)
      
      setArtists(aiArtists.map(artist => ({
        ...artist,
        artist_type: artist.artist_type as ArtistRole,
        artworks: [{ count: artist.artworks?.[0]?.count || 0 }]
      })))
      setHasMore(false)
      
      setSearchQuery('')
      setArtistType('')
      setSortBy('created_at')
      setSortOrder('desc')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('Error in AI search:', error)
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
    } finally {
      setIsAISearching(false)
    }
  }
  */

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
      <div className="flex flex-col gap-4">
        <SearchForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          artistType={artistType}
          setArtistType={setArtistType}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
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