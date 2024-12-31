'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { followArtist, unfollowArtist, isFollowingArtist } from '@/lib/actions/social';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  artistId: string;
  className?: string;
}

export function FollowButton({ artistId, className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const checkFollowStatus = async () => {
      if (!user) {
        if (isMounted) {
          setIsFollowing(false);
        }
        return;
      }

      try {
        const { isFollowing: following } = await isFollowingArtist(artistId);
        if (isMounted) {
          setIsFollowing(following);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
        if (isMounted) {
          setIsFollowing(false);
        }
      }
    };

    checkFollowStatus();

    return () => {
      isMounted = false;
    };
  }, [artistId, user]);

  const handleClick = async () => {
    if (!user) {
      toast.error('Please sign in to follow artists');
      return;
    }

    setIsLoading(true);
    try {
      // Optimistic update
      setIsFollowing(!isFollowing);

      const action = isFollowing ? unfollowArtist : followArtist;
      const { success, error } = await action(artistId);

      if (!success) {
        // Revert optimistic update on failure
        setIsFollowing(isFollowing);
        throw new Error(error);
      }

      toast.success(isFollowing ? 'Unfollowed artist' : 'Following artist');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while we don't know the follow status
  if (isFollowing === null) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={className}
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'default'}
      size="sm"
      className={className}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isFollowing ? 'Unfollow artist' : 'Follow artist'}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" aria-hidden="true" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
      )}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
} 