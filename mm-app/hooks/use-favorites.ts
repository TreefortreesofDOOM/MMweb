import { useState, useEffect, useCallback, useRef } from 'react';
import { hasFavoritedArtwork, favoriteArtwork, unfavoriteArtwork } from '@/lib/actions/social';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

// Cache for favorite status
const favoriteCache = new Map<string, boolean>([['', false]]);

export function useFavorites(artworkIds: string[]) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const isMounted = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRequests = useRef<AbortController[]>([]);

  // Cleanup function to abort pending requests
  const abortPendingRequests = useCallback(() => {
    pendingRequests.current.forEach(controller => controller.abort());
    pendingRequests.current = [];
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!user || !artworkIds.length) return;
    
    try {
      // Check cache first
      const uncachedIds = artworkIds.filter(id => !favoriteCache.has(id));
      
      if (uncachedIds.length === 0) {
        // All favorites are cached
        setFavorites(
          artworkIds.reduce((acc, id) => ({
            ...acc,
            [id]: favoriteCache.get(id) || false
          }), {})
        );
        return;
      }

      // Create new abort controller for this batch of requests
      const controller = new AbortController();
      pendingRequests.current.push(controller);

      const results = await Promise.all(
        uncachedIds.map(async (id) => {
          const { hasFavorited } = await hasFavoritedArtwork(id);
          // Update cache
          favoriteCache.set(id, hasFavorited);
          return [id, hasFavorited] as const;
        })
      );
      
      if (isMounted.current) {
        setFavorites(prev => ({
          ...prev,
          ...Object.fromEntries(results)
        }));
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching favorites:', error);
      }
    }
  }, [user, artworkIds]);

  useEffect(() => {
    isMounted.current = true;

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Abort any pending requests
    abortPendingRequests();

    // Only fetch if we have artworkIds
    if (artworkIds.length > 0) {
      // Debounce the fetch
      fetchTimeoutRef.current = setTimeout(fetchFavorites, 100);
    }

    return () => {
      isMounted.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      abortPendingRequests();
    };
  }, [artworkIds, fetchFavorites, abortPendingRequests]);

  const toggleFavorite = async (artworkId: string) => {
    if (!user) {
      toast.error('Please sign in to favorite artworks');
      return;
    }

    setIsLoading(prev => ({ ...prev, [artworkId]: true }));
    try {
      const isFavorited = favorites[artworkId];
      // Optimistic update
      const newFavoriteStatus = !isFavorited;
      setFavorites(prev => ({ ...prev, [artworkId]: newFavoriteStatus }));
      favoriteCache.set(artworkId, newFavoriteStatus); // Update cache

      const action = isFavorited ? unfavoriteArtwork : favoriteArtwork;
      const { success, error } = await action(artworkId);

      if (!success) {
        // Revert optimistic update
        setFavorites(prev => ({ ...prev, [artworkId]: isFavorited }));
        favoriteCache.set(artworkId, isFavorited); // Revert cache
        throw new Error(error);
      }

      // Ensure the cache and state are in sync after successful update
      setFavorites(prev => ({ ...prev, [artworkId]: newFavoriteStatus }));
      favoriteCache.set(artworkId, newFavoriteStatus);

      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error: any) {
      console.error('Error favoriting artwork:', error);
      toast.error(error.message || 'Failed to update favorite status');
    } finally {
      if (isMounted.current) {
        setIsLoading(prev => ({ ...prev, [artworkId]: false }));
      }
    }
  };

  return {
    favorites,
    isLoading,
    toggleFavorite
  };
} 