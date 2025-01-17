'use client';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/core/common-utils";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils/core/common-utils";
import { FavoriteButton } from '@/components/social';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ArtworkCardProps {
  artwork: {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    status?: 'draft' | 'published';
    images: Array<{
      url: string;
      isPrimary?: boolean;
      order: number;
    }>;
    artist_id: string;
    profiles?: {
      id: string;
      name: string;
      avatar_url: string;
    } | null;
  };
  showFavorite?: boolean;
  showStatus?: boolean;
  showEdit?: boolean;
  isLoading?: boolean;
  isFavorited?: boolean;
  isEmergingArtist?: boolean;
  isAtPublishLimit?: boolean;
  onSelect?: () => void;
  onToggleFavorite?: () => void;
  onPublish?: (id: string) => Promise<void> | void;
  onUnpublish?: (id: string) => Promise<void> | void;
}

export function ArtworkCard({
  artwork,
  showFavorite = true,
  showStatus = false,
  showEdit = false,
  isLoading = false,
  isFavorited = false,
  isEmergingArtist = false,
  isAtPublishLimit = false,
  onSelect,
  onToggleFavorite = () => { },
  onPublish,
  onUnpublish
}: ArtworkCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const sortedImages = (artwork.images || [])
    .filter(img => img.url && img.url.trim() !== '')
    .sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return a.order - b.order;
    });

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === sortedImages.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? sortedImages.length - 1 : prev - 1
    );
  };

  if (sortedImages.length === 0) {
    return (
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary truncate">{artwork.title}</h3>
            {artwork.price !== null && (
              <p className="text-sm font-medium text-muted-foreground">{formatPrice(artwork.price)}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300",
        onSelect && "cursor-pointer"
      )}
      onClick={() => onSelect?.()}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect();
        }
      }}
      suppressHydrationWarning
    >
      {artwork.profiles && (
        <CardContent className="p-6 pb-4 border-b">
          <Link href={`/artists/${artwork.profiles.id}`} className="flex items-center gap-3 hover:opacity-80">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={artwork.profiles?.avatar_url}
                alt={artwork.profiles?.name || 'Artist'}
              />
              <AvatarFallback>
                {artwork.profiles?.name ? artwork.profiles.name.charAt(0) : 'A'}
              </AvatarFallback>
            </Avatar>
            <span className="text-base font-medium">
              {artwork.profiles?.name || 'Unknown Artist'}
            </span>
          </Link>
        </CardContent>
      )}

      <div className="relative aspect-square">
        {imageError ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Image unavailable</span>
          </div>
        ) : (
          <Image
            src={sortedImages[currentImageIndex].url}
            alt={artwork.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
            quality={85}
            onError={() => setImageError(true)}
          />
        )}
        {sortedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      <CardContent className="p-6 pt-5">
        <div className="flex flex-col gap-5">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold tracking-tight">{artwork.title}</h3>
            {artwork.description && (
              <p className="text-base text-muted-foreground leading-relaxed line-clamp-2">
                {artwork.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between py-1">
            {artwork.price !== null && (
              <span className="text-2xl font-bold">{formatPrice(artwork.price)}</span>
            )}
            {showFavorite && (
              <FavoriteButton
                artworkId={artwork.id}
                variant="ghost"
                isFavorited={isFavorited}
                isLoading={isLoading}
                onToggle={onToggleFavorite}
              />
            )}
          </div>
          {showStatus && artwork.status && (
            <Badge variant={artwork.status === 'published' ? 'default' : 'secondary'} className="w-fit">
              {artwork.status}
            </Badge>
          )}
        </div>
      </CardContent>

      {(showEdit || showStatus) && (
        <CardFooter className="p-4 pt-0 flex justify-between">
          {showEdit && (
            <Link href={`/artist/artworks/${artwork.id}/edit`} passHref>
              <Button variant="outline" className="w-full mr-2">Edit</Button>
            </Link>
          )}
          {showStatus && artwork.status && (
            artwork.status === 'published' ? (
              <Button
                variant="secondary"
                onClick={() => onUnpublish?.(artwork.id)}
                disabled={isLoading}
                className="w-full ml-2"
              >
                Unpublish
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => onPublish?.(artwork.id)}
                disabled={isLoading || (isEmergingArtist && isAtPublishLimit)}
                className="w-full ml-2"
                title={isAtPublishLimit ? "Emerging artists can only publish 10 artworks" : undefined}
              >
                Publish
              </Button>
            )
          )}
        </CardFooter>
      )}
    </Card>
  );
} 