'use client';

import { useState } from 'react';
import { ArtworkCard } from './artwork-card';
import { ArtworkModal } from './artwork-modal';

interface ArtworkGalleryProps {
  artworks: Array<{
    id: string;
    title: string;
    description?: string;
    price: number;
    status: string;
    images: Array<{
      url: string;
      isPrimary: boolean;
      order: number;
    }>;
    artist?: {
      name?: string;
      bio?: string;
    };
  }>;
}

export function ArtworkGallery({ artworks }: ArtworkGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const isModalOpen = selectedIndex !== -1;

  const handleCloseModal = () => {
    setSelectedIndex(-1);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork, index) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            onSelect={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      <ArtworkModal
        artworks={artworks}
        currentIndex={selectedIndex}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNavigate={setSelectedIndex}
      />
    </>
  );
} 