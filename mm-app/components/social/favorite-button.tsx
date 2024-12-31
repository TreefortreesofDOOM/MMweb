'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Heart } from 'lucide-react';

interface FavoriteButtonProps {
  artworkId: string;
  variant?: 'default' | 'ghost';
  isFavorited?: boolean;
  isLoading?: boolean;
  onToggle: (artworkId: string) => void;
}

export function FavoriteButton({
  artworkId,
  variant = 'default',
  isFavorited = false,
  isLoading = false,
  onToggle,
}: FavoriteButtonProps) {
  return (
    <Button
      variant={variant}
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(artworkId);
      }}
      disabled={isLoading}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart 
          className={`h-5 w-5 ${isFavorited ? 'fill-current text-red-500' : ''}`} 
        />
      )}
    </Button>
  );
} 