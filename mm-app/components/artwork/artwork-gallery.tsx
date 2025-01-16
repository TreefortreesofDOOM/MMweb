'use client';

import { useState, useCallback, useMemo } from 'react';
import { ArtworkCard } from './artwork-card';
import { ArtworkModal } from './artwork-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/use-favorites';

interface ArtworkGalleryProps {
  artworks: Array<{
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    status?: 'draft' | 'published';
    images: Array<{
      url: string;
      isPrimary?: boolean;
      order: number;
    }>;
    artist_id: string;
    profiles?: {
      id: string;
      name: string;
      avatar_url: string;
    } | null;
  }>;
  isLoading?: boolean;
}

export function ArtworkGallery({ artworks, isLoading = false }: ArtworkGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const isModalOpen = selectedIndex !== -1;
  
  const artworkIds = useMemo(() => artworks.map(artwork => artwork.id), [artworks]);
  
  const { favorites, isLoading: isFavoriteLoading, toggleFavorite } = useFavorites(artworkIds);

  const handleCloseModal = useCallback(() => {
    setSelectedIndex(-1);
  }, []);

  const handleSelectArtwork = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleToggleFavorite = useCallback((artworkId: string) => {
    toggleFavorite(artworkId);
  }, [toggleFavorite]);

  // Transform artworks for modal
  const modalArtworks = useMemo(() => artworks.map(artwork => ({
    id: artwork.id,
    title: artwork.title,
    description: artwork.description || undefined,
    price: artwork.price || 0,
    images: artwork.images.map(img => ({
      url: img.url,
      isPrimary: img.isPrimary || false
    })),
    artist: artwork.profiles ? {
      id: artwork.profiles.id,
      name: artwork.profiles.name,
      avatar_url: artwork.profiles.avatar_url
    } : undefined
  })), [artworks]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork, index) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            onSelect={() => handleSelectArtwork(index)}
            isFavorited={favorites[artwork.id] || false}
            isLoading={isFavoriteLoading[artwork.id] || false}
            onToggleFavorite={() => handleToggleFavorite(artwork.id)}
          />
        ))}
      </div>

      {isModalOpen && modalArtworks[selectedIndex] && (
        <ArtworkModal
          artworks={modalArtworks}
          currentIndex={selectedIndex}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onNavigate={handleSelectArtwork}
          favorites={favorites}
          isLoading={isFavoriteLoading}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </>
  );
} 