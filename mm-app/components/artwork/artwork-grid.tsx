'use client';

import { useEffect, useState } from 'react';
import { ArtworkCard } from './artwork-card';
import { getSimilarArtworks } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

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
    <div className="space-y-12">
      {/* Main Artwork Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
        {artworks.map((artwork) => (
          <div
            key={artwork.id}
            className="group cursor-pointer"
            onClick={() => setSelectedArtwork(artwork.id)}
          >
            <div className="transform transition-all duration-300 group-hover:translate-y-[-4px]">
              <ArtworkCard artwork={artwork} />
            </div>
          </div>
        ))}
      </div>

      {/* Similar Artworks Section */}
      {showSimilar && selectedArtwork && (
        <div className="border-t pt-12">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-primary">Similar Artworks</h2>
            {isLoadingSimilar && (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Loading similar artworks...</span>
              </div>
            )}
          </div>
          
          {similarArtworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {similarArtworks.map((artwork) => (
                <div key={artwork.id} className="group cursor-pointer">
                  <div className="transform transition-all duration-300 group-hover:translate-y-[-4px]">
                    <ArtworkCard artwork={artwork} />
                    {artwork.similarity !== undefined && (
                      <div className="mt-2 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {Math.round(artwork.similarity * 100)}% match
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : !isLoadingSimilar && (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No similar artworks found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 