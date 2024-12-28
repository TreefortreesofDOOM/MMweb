'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, KeyboardEvent, useMemo } from 'react'
import { ArtistBadge } from '@/components/ui/artist-badge'
import { ExhibitionBadge } from '@/components/ui/exhibition-badge'
import { cn } from '@/lib/utils'
import { type ArtistRole, ARTIST_ROLES } from '@/lib/types/custom-types'
import type { ArtistWithCount } from './artists-client'

interface ArtistCardProps {
  artist: ArtistWithCount;
  index: number;
  totalArtists: number;
}

export function ArtistCard({ artist, index, totalArtists }: ArtistCardProps) {
  const router = useRouter();
  
  const initials = useMemo(() => {
    return artist.full_name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || '';
  }, [artist.full_name]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(`/artists/${artist.id}`);
    } else if (e.key === 'ArrowRight' && index < totalArtists - 1) {
      e.preventDefault();
      const nextCard = document.querySelector(`[data-index="${index + 1}"]`) as HTMLElement;
      nextCard?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevCard = document.querySelector(`[data-index="${index - 1}"]`) as HTMLElement;
      prevCard?.focus();
    }
  }, [artist.id, index, totalArtists, router]);

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
      <Link href={`/artists/${artist.id}`}>
        <Card className={cn(
          "group h-full overflow-hidden transition-colors hover:bg-muted/50",
          isVerified && "border-primary/20",
          !isVerified && "border-secondary/20"
        )}>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={artist.avatar_url || undefined} 
                alt={`${artist.full_name}'s profile picture`} 
              />
              <AvatarFallback aria-hidden="true">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold leading-none">{artist.full_name}</p>
                {isVerified && (
                  <div className="flex items-center gap-2">
                    <ArtistBadge type={ARTIST_ROLES.VERIFIED} />
                    {artist.exhibition_badge && <ExhibitionBadge />}
                  </div>
                )}
              </div>
              {artist.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  <span>{artist.location}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {artworkCount} {artworkCount === 1 ? 'artwork' : 'artworks'}
              </p>
              <ArtistBadge type={artistType} />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
} 