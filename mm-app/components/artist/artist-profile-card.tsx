'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FollowButton } from '@/components/social'
import { ArtistBadge } from '@/components/ui/artist-badge'
import { MapPin } from 'lucide-react'
import type { UserRole } from '@/lib/types/custom-types'
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
  role: UserRole;
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
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={artist.avatar_url || ''} alt={artist.full_name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl">{artist.full_name}</CardTitle>
          {artist.location && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="mr-1 h-4 w-4" />
              {artist.location}
            </div>
          )}
        </div>
      </div>
      {showFollow && !isOwnProfile && (
        <FollowButton artistId={artist.id} />
      )}
    </div>
  );

  // Bio section
  const BioSection = () => (
    artist.bio && (
      <div className="space-y-1">
        <h3 className="text-sm font-medium">About</h3>
        <p className="text-sm text-muted-foreground">{artist.bio}</p>
      </div>
    )
  );

  // Mediums section
  const MediumsSection = () => (
    artist.medium && artist.medium.length > 0 && (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Mediums</h3>
        <div className="flex flex-wrap gap-1">
          {artist.medium.map((medium) => (
            <Badge key={medium} variant="secondary">
              {medium}
            </Badge>
          ))}
        </div>
      </div>
    )
  );

  // Links section
  const LinksSection = () => (
    (artist.website || artist.instagram) && (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Links</h3>
        <div className="flex flex-wrap gap-2">
          {artist.website && (
            <a
              href={artist.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Website
            </a>
          )}
          {artist.instagram && (
            <a
              href={`https://instagram.com/${artist.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Instagram
            </a>
          )}
        </div>
      </div>
    )
  );

  return (
    <Card className={className}>
      <CardHeader>
        <HeaderContent />
        {showBadge && (artist.role === 'verified_artist' || artist.role === 'emerging_artist') && (
          <ArtistBadge role={artist.role} className="mt-2" />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <BioSection />
        <MediumsSection />
        <LinksSection />
      </CardContent>
    </Card>
  );
} 