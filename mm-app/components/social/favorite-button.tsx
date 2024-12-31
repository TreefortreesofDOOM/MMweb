'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { favoriteArtwork, unfavoriteArtwork, hasFavoritedArtwork } from '@/lib/actions/social';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  artworkId: string;
  className?: string;
  variant?: 'default' | 'ghost';
}

export function FavoriteButton({ artworkId, className, variant = 'default' }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) return;
      const { hasFavorited } = await hasFavoritedArtwork(artworkId);
      setIsFavorited(hasFavorited);
    };

    checkFavoriteStatus();
  }, [artworkId, user]);

  const handleClick = async () => {
    if (!user) {
      toast.error('Please sign in to favorite artworks');
      return;
    }

    setIsLoading(true);
    try {
      // Optimistic update
      setIsFavorited(!isFavorited);

      const action = isFavorited ? unfavoriteArtwork : favoriteArtwork;
      const { success, error } = await action(artworkId);

      if (!success) {
        // Revert optimistic update on failure
        setIsFavorited(isFavorited);
        throw new Error(error);
      }

      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorite status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={cn(
        'group',
        variant === 'ghost' && 'hover:bg-transparent',
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <Heart
        className={cn(
          'h-4 w-4 mr-2 transition-colors',
          isFavorited ? 'fill-current' : 'group-hover:fill-current',
          variant === 'ghost' && 'text-muted-foreground group-hover:text-foreground'
        )}
        aria-hidden="true"
      />
      {isFavorited ? 'Favorited' : 'Favorite'}
    </Button>
  );
} 