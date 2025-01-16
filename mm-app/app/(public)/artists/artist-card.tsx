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
import type { UserRole } from '@/lib/types/custom-types'
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
        role: artist.role,
        position: index,
        totalArtists,
        interactionType: 'keyboard'
      });
      router.push(`/artists/${artist.id}`);
    }
  }, [artist.id, artist.role, index, totalArtists, router]);

  const handleClick = useCallback(async () => {
    await trackArtistView({
      artistId: artist.id,
      role: artist.role,
      position: index,
      totalArtists,
      interactionType: 'click'
    });
  }, [artist.id, artist.role, index, totalArtists]);

  const artworkCount = artist.artworks[0]?.count || 0;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all hover:border-primary',
        'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary'
      )}
      role="article"
      aria-label={`Artist: ${artist.full_name}`}
    >
      <Link
        href={`/artists/${artist.id}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="block outline-none"
        tabIndex={0}
      >
        <CardHeader className="grid gap-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={artist.avatar_url || ''} alt={artist.full_name || ''} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                  {artist.full_name}
                </h3>
                {artist.location && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="mr-1 h-3 w-3" />
                    {artist.location}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <ArtistBadge role={artist.role as UserRole} />
              {artist.exhibition_badge && <ExhibitionBadge />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>{artworkCount} artworks</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
} 