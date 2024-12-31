'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArtworkGallery } from "@/components/artwork/artwork-gallery";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface FeaturedArtistProps {
  artist: {
    id: string;
    name: string;
    bio: string | null;
    avatar_url: string | null;
  };
  artworks: any[];
}

export function FeaturedArtist({ artist, artworks }: FeaturedArtistProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!artist) return null;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Link href={`/artists/${artist.id}/portfolio`} className="w-full">
            <Avatar className="h-20 w-20">
              <AvatarImage src={artist.avatar_url || ''} alt={artist.name} />
              <AvatarFallback>{artist.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <CardTitle className="text-2xl">Featured Artist: {artist.name}</CardTitle>
            <CardDescription 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`mt-2 text-base cursor-pointer hover:text-foreground transition-colors ${!isExpanded ? 'line-clamp-2' : ''}`}
            >
              {artist.bio || 'No bio available'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <ArtworkGallery artworks={artworks} />
          </div>
        </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>
    </div>
  );
} 