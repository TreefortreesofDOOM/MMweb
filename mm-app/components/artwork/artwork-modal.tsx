'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/core/common-utils";
import { cn } from "@/lib/utils/core/common-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FavoriteButton } from "@/components/social";

interface ArtworkModalProps {
  artworks: Array<{
    id: string;
    title: string;
    description?: string;
    price: number;
    images: Array<{
      url: string;
      isPrimary: boolean;
    }>;
    artist?: {
      id?: string;
      name?: string;
      bio?: string;
      avatar_url?: string;
    };
  }>;
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  favorites: Record<string, boolean>;
  isLoading: Record<string, boolean>;
  onToggleFavorite: (artworkId: string) => void;
}

export function ArtworkModal({
  artworks,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  favorites,
  isLoading,
  onToggleFavorite,
}: ArtworkModalProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  useEffect(() => {
    setIsDescriptionExpanded(false);
  }, [currentIndex]);

  const artwork = artworks[currentIndex];
  if (!artwork) return null;

  const primaryImage = artwork.images.find(img => img.isPrimary) || artwork.images[0];
  if (!primaryImage) return null;

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? artworks.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  }, [currentIndex, artworks.length, onNavigate]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex === artworks.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  }, [currentIndex, artworks.length, onNavigate]);

  const toggleDescription = useCallback(() => {
    setIsDescriptionExpanded(prev => !prev);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full max-h-[95vh] overflow-y-auto scrollbar-hide">
        <DialogHeader className="sr-only">
          <DialogTitle>{artwork.title}</DialogTitle>
          <DialogDescription>Detailed view of {artwork.title}</DialogDescription>
        </DialogHeader>
        
        <div className="relative h-[60vh] bg-background">
          <Image
            src={primaryImage.url}
            alt={artwork.title}
            fill
            className="object-contain"
            priority
          />
          
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/50 hover:bg-background/70"
              onClick={handlePrevious}
              aria-label="Previous artwork"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/50 hover:bg-background/70"
              onClick={handleNext}
              aria-label="Next artwork"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-none">
              <CardHeader className="px-0 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold">{artwork.title}</CardTitle>
                    <div className="flex items-center gap-4">
                      <p className="text-2xl font-semibold">{formatPrice(artwork.price)}</p>
                      <FavoriteButton
                        artworkId={artwork.id}
                        variant="ghost"
                        isFavorited={favorites[artwork.id] || false}
                        isLoading={isLoading[artwork.id] || false}
                        onToggle={onToggleFavorite}
                      />
                    </div>
                  </div>
                  {artwork.artist?.name && (
                    <Link 
                      href={`/artists/${artwork.artist.id}`}
                      className="flex items-center gap-3 hover:opacity-80"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={artwork.artist.avatar_url || ''} alt={artwork.artist.name} />
                        <AvatarFallback>{artwork.artist.name?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-base font-medium">{artwork.artist.name}</span>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-0">
                {artwork.description && (
                  <div>
                    <p className={cn(
                      "text-sm text-muted-foreground",
                      !isDescriptionExpanded && "line-clamp-3"
                    )}>
                      {artwork.description}
                    </p>
                    {artwork.description.length > 180 && (
                      <button
                        onClick={toggleDescription}
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        {isDescriptionExpanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 