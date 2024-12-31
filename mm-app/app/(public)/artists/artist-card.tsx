'use client'

import { useCallback, KeyboardEvent, useMemo } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MapPin, ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ArtistBadge } from '@/components/ui/artist-badge'
import { ExhibitionBadge } from '@/components/ui/exhibition-badge'
import { cn } from '@/lib/utils/common-utils'
import { type ArtistRole, ARTIST_ROLES } from '@/lib/types/custom-types'
import type { ArtistWithCount } from './artists-client'
import { trackArtistView } from '@/lib/actions/analytics'

interface ArtistCardProps {
  artist: ArtistWithCount;
  index: number;
  totalArtists: number;
}

export function ArtistCard({ artist, index, totalArtists }: ArtistCardProps) {
  const router = useRouter();
  
  console.log('Rendering artist:', {
    name: artist.full_name,
    role: artist.role,
    exhibition_badge: artist.exhibition_badge,
    index,
    created_at: artist.created_at,
    id: artist.id
  });

  const initials = useMemo(() => {
    return artist.full_name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || '';
  }, [artist.full_name]);

  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      await trackArtistView({
        artistId: artist.id,
        artistType: artist.artist_type || '',
        position: index,
        totalArtists,
        interactionType: 'keyboard'
      });
      router.push(`/artists/${artist.id}/portfolio`);
    } else if (e.key === 'ArrowRight' && index < totalArtists - 1) {
      e.preventDefault();
      const nextCard = document.querySelector(`[data-index="${index + 1}"]`) as HTMLElement;
      nextCard?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevCard = document.querySelector(`[data-index="${index - 1}"]`) as HTMLElement;
      prevCard?.focus();
    }
  }, [artist.id, artist.artist_type, index, totalArtists, router]);

  const handleClick = useCallback(async () => {
    await trackArtistView({
      artistId: artist.id,
      artistType: artist.artist_type || '',
      position: index,
      totalArtists,
      interactionType: 'click'
    });
  }, [artist.id, artist.artist_type, index, totalArtists]);

  const artistType = artist.artist_type || ARTIST_ROLES.EMERGING;
  const artworkCount = artist.artworks[0]?.count || 0;
  const isVerified = artistType === ARTIST_ROLES.VERIFIED;

  return (
    <div
      tabIndex={0}
      data-index={index}
      onKeyDown={handleKeyDown}
      aria-label={`${artist.full_name}'s profile - ${isVerified ? 'Verified' : 'Emerging'} Artist with ${artworkCount} artworks${artist.location ? ` from ${artist.location}` : ''}`}
      className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Link href={`/artists/${artist.id}/portfolio`} onClick={handleClick}>
        <Card className={cn(
          "group h-full overflow-hidden transition-colors hover:bg-muted/50",
          isVerified && "border-primary/20",
          !isVerified && "border-secondary/20"
        )}>
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage 
                    src={artist.avatar_url || undefined} 
                    alt={`${artist.full_name}'s profile picture`} 
                  />
                  <AvatarFallback aria-hidden="true">{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold leading-none">{artist.full_name}</h3>
                  {artist.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      <span>{artist.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <ArtistBadge type={artistType} />
                {artist.exhibition_badge && (
                  <ExhibitionBadge />
                )}
              </div>
            </div>
            {artist.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>
                {artworkCount} {artworkCount === 1 ? 'artwork' : 'artworks'}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
} 