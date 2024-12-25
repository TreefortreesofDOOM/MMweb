'use client';

import { useEffect, useState } from 'react';
import { ArtworkCard } from './artwork-card';
import { getSimilarArtworks } from '@/app/actions';

interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  images: Array<{
    url: string;
    isPrimary: boolean;
    order: number;
  }>;
  similarity?: number;
}

interface ArtworkGridProps {
  artworks: Artwork[];
  showSimilar?: boolean;
}

export function ArtworkGrid({ artworks, showSimilar = true }: ArtworkGridProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);
  const [similarArtworks, setSimilarArtworks] = useState<Artwork[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  useEffect(() => {
    async function loadSimilarArtworks() {
      if (!selectedArtwork || !showSimilar) return;
      
      setIsLoadingSimilar(true);
      try {
        const { artworks, error } = await getSimilarArtworks(selectedArtwork);
        if (error) throw error;
        setSimilarArtworks(artworks || []);
      } catch (error) {
        console.error('Error loading similar artworks:', error);
      } finally {
        setIsLoadingSimilar(false);
      }
    }

    loadSimilarArtworks();
  }, [selectedArtwork, showSimilar]);

  return (
    <div className="space-y-8">
      {/* Main Artwork Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <div
            key={artwork.id}
            className="cursor-pointer"
            onClick={() => setSelectedArtwork(artwork.id)}
          >
            <ArtworkCard artwork={artwork} />
          </div>
        ))}
      </div>

      {/* Similar Artworks Section */}
      {showSimilar && selectedArtwork && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">
            Similar Artworks
            {isLoadingSimilar && <span className="ml-2 text-muted-foreground">(Loading...)</span>}
          </h2>
          {similarArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarArtworks.map((artwork) => (
                <div key={artwork.id} className="cursor-pointer">
                  <ArtworkCard artwork={artwork} />
                  {artwork.similarity && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {Math.round(artwork.similarity * 100)}% match
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : !isLoadingSimilar && (
            <p className="text-muted-foreground">No similar artworks found.</p>
          )}
        </div>
      )}
    </div>
  );
} 