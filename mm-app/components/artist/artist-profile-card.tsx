'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FollowButton } from '@/components/social'
import { ArtistBadge } from '@/components/ui/artist-badge'
import { MapPin } from 'lucide-react'
import type { ArtistRole } from '@/lib/types/custom-types'
import { Badge } from "@/components/ui/badge"
import { useUser } from '@/hooks/use-user'

interface Artist {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  instagram: string | null;
  location: string | null;
  artist_type: ArtistRole;
  medium?: string[];
}

interface ArtistProfileCardProps {
  artist: Artist;
  isPublicRoute?: boolean;
  showFollow?: boolean;
  showBadge?: boolean;
  className?: string;
}

export function ArtistProfileCard({ 
  artist, 
  isPublicRoute = false,
  showFollow = true,
  showBadge = true,
  className 
}: ArtistProfileCardProps) {
  const { user } = useUser();
  const isOwnProfile = user?.id === artist.id;

  const initials = artist.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '';

  // Common header content
  const HeaderContent = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={artist.avatar_url || ''} alt={artist.full_name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-3xl">{artist.full_name}</CardTitle>
          {artist.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{artist.location}</span>
            </div>
          )}
          {!isPublicRoute && showBadge && (
            <ArtistBadge type={artist.artist_type} className="mt-2" />
          )}
        </div>
      </div>
      {showFollow && !isOwnProfile && <FollowButton artistId={artist.id} />}
    </div>
  );

  // Common content sections
  const BioSection = () => (
    artist.bio && (
      <div>
        <h2 className="text-lg font-semibold mb-2">About the Artist</h2>
        <p className="text-muted-foreground">{artist.bio}</p>
      </div>
    )
  );

  const MediumsSection = () => (
    artist.medium && artist.medium.length > 0 && (
      <div>
        <h2 className="text-lg font-semibold mb-2">Mediums</h2>
        <div className="flex flex-wrap gap-1">
          {artist.medium.map((medium) => (
            <Badge
              key={medium}
              variant="secondary"
            >
              {medium}
            </Badge>
          ))}
        </div>
      </div>
    )
  );

  const LinksSection = () => (
    <div className="space-y-2">
      {artist.website && (
        <p>
          <span className="font-medium">Website: </span>
          <a 
            href={artist.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {artist.website}
          </a>
        </p>
      )}
      {artist.instagram && (
        <p>
          <span className="font-medium">Instagram: </span>
          <a 
            href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {artist.instagram}
          </a>
        </p>
      )}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <HeaderContent />
      </CardHeader>
      <CardContent className="space-y-4">
        <BioSection />
        <MediumsSection />
        <LinksSection />
      </CardContent>
    </Card>
  );
} 