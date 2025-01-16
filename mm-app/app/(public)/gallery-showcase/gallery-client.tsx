'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { createBrowserClient } from '@/lib/supabase/supabase-client';
import { ArtworkGallery } from '@/components/artwork/artwork-gallery';
import { useToast } from '@/components/ui/use-toast';

const ARTWORKS_PER_PAGE = 12;

interface ArtworkImage {
  url: string;
  isPrimary?: boolean;
  order: number;
}

interface Artist {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
}

interface Artwork {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: 'draft' | 'published';
  images: ArtworkImage[];
  artist_id: string;
  artist: Artist;
  profiles?: {
    id: string;
    name: string;
    avatar_url: string;
  } | null;
}

interface GalleryClientProps {
  initialArtworks: Artwork[];
  featuredArtistId: string | null;
}

export function GalleryClient({ initialArtworks, featuredArtistId }: GalleryClientProps) {
  const [artworks, setArtworks] = useState(initialArtworks);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialArtworks.length === ARTWORKS_PER_PAGE);
  const { ref, inView } = useInView();
  const currentPageRef = useRef(2);
  const fetchingRef = useRef(false);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const fetchArtworks = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;
    fetchingRef.current = true;
    setIsLoading(true);

    try {
      const { data: newArtworks, error } = await supabase
        .from('artworks_with_artist')
        .select('*')
        .eq('status', 'published')
        .neq('artist_id', featuredArtistId)
        .order('created_at', { ascending: false })
        .range((currentPageRef.current - 1) * ARTWORKS_PER_PAGE, currentPageRef.current * ARTWORKS_PER_PAGE - 1);

      if (error) throw error;

      if (newArtworks) {
        const transformedArtworks = newArtworks.map((artwork: any) => ({
          ...artwork,
          artist: {
            id: artwork.artist_id,
            name: artwork.artist_name,
            bio: artwork.artist_bio,
            avatar_url: artwork.artist_avatar_url
          }
        }));

        setArtworks(prev => [...prev, ...transformedArtworks]);
        setHasMore(newArtworks.length === ARTWORKS_PER_PAGE);
        currentPageRef.current += 1;
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load more artworks. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [supabase, toast]);

  useEffect(() => {
    if (inView && hasMore && !isLoading && !fetchingRef.current) {
      fetchArtworks();
    }
  }, [inView, hasMore, isLoading, fetchArtworks]);

  return (
    <div className="space-y-8">
      <ArtworkGallery artworks={artworks} isLoading={isLoading} />
      {hasMore && (
        <div ref={ref} className="h-10" role="status" aria-label="Loading more artworks">
          {isLoading && <div className="text-center text-muted-foreground">Loading more artworks...</div>}
        </div>
      )}
    </div>
  );
} 