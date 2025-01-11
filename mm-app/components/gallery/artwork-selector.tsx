'use client';

import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/supabase-client';
import { useArtist } from '@/hooks/use-artist';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { WallTypeSelect } from './wall-type-select';
import type { Database } from '@/lib/types/database.types';

type Artwork = Database['public']['Tables']['artworks']['Row'];
type ArtworkImage = { url: string; isPrimary?: boolean; order?: number };

interface ArtworkSelectorProps {
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;
  showWallType?: boolean;
}

export const ArtworkSelector = ({
  selectedIds = [],
  onSelect,
  showWallType = false
}: ArtworkSelectorProps) => {
  const { profile, isArtist } = useArtist();

  const { data: artworks, isLoading, error } = useQuery({
    queryKey: ['artworks', profile?.id],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', profile?.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      return data as Artwork[];
    },
    enabled: !!profile?.id && isArtist
  });

  const handleToggle = (artworkId: string) => {
    if (!onSelect) return;
    
    const newSelection = selectedIds.includes(artworkId)
      ? selectedIds.filter(id => id !== artworkId)
      : [...selectedIds, artworkId];
    
    onSelect(newSelection);
  };

  if (!isArtist) {
    return <div className="text-sm text-destructive">You must be an artist to access this feature.</div>;
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading artworks...</div>;
  }

  if (error) {
    return <div className="text-sm text-destructive">Failed to load artworks. Please try again.</div>;
  }

  if (!artworks?.length) {
    return <div className="text-sm text-muted-foreground">No published artworks found.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {artworks.map((artwork) => (
        <Card 
          key={artwork.id}
          className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-200"
        >
          <CardContent className="p-0">
            {/* Artwork Image */}
            <div className="relative aspect-square">
              <img
                src={Array.isArray(artwork.images) 
                  ? (artwork.images as ArtworkImage[])[0]?.url 
                  : (artwork.images as any)?.main}
                alt={artwork.title}
                className="object-cover w-full h-full"
              />
              {/* Selection Checkbox */}
              <div className="absolute top-2 right-2 z-10">
                <Checkbox
                  checked={selectedIds.includes(artwork.id)}
                  onCheckedChange={() => handleToggle(artwork.id)}
                  aria-label={`Select ${artwork.title}`}
                  className="bg-white border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white cursor-pointer"
                />
              </div>
            </div>
            
            {/* Artwork Info */}
            <div className="p-3 space-y-2">
              <h3 className="font-medium truncate text-sm">{artwork.title}</h3>
              {showWallType && (
                <WallTypeSelect
                  artworkId={artwork.id}
                  currentType={artwork.gallery_wall_type || undefined}
                  currentPrice={artwork.gallery_price || artwork.price || 0}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 