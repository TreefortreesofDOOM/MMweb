'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

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
    };
  }>;
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ArtworkModal({
  artworks,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ArtworkModalProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  if (!artworks.length || currentIndex < 0 || currentIndex >= artworks.length) return null;
  
  const artwork = artworks[currentIndex];
  if (!artwork) return null;

  const primaryImage = artwork.images.find(img => img.isPrimary) || artwork.images[0];
  if (!primaryImage) return null;

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? artworks.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex === artworks.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{artwork.title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative h-full flex flex-col overflow-hidden">
          {/* Image Section */}
          <div className="relative w-full h-[70vh] bg-background">
            <div className="absolute inset-x-0 top-6 bottom-6">
              <Image
                src={primaryImage.url}
                alt={artwork.title}
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Navigation buttons */}
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

          {/* Details Section */}
          <div className="flex-1 w-full overflow-y-auto scrollbar-hide">
            <div className="p-8">
              <div className="max-w-2xl mx-auto space-y-4">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{artwork.title}</CardTitle>
                        {artwork.artist?.name && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">by {artwork.artist.name}</p>
                            {artwork.artist.id && (
                              <Link 
                                href={`/artists/${artwork.artist.id}`}
                                className="inline-flex items-center text-xs text-primary hover:underline"
                                onClick={onClose}
                              >
                                View all works by this artist →
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xl font-semibold">{formatPrice(artwork.price)}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0 space-y-4">
                    {artwork.description && (
                      <div>
                        <p className={cn(
                          "text-sm text-muted-foreground",
                          !isDescriptionExpanded && "line-clamp-3"
                        )}>
                          {artwork.description}
                        </p>
                        <button
                          onClick={toggleDescription}
                          className="text-xs text-primary hover:underline mt-1"
                        >
                          {isDescriptionExpanded ? "Show less" : "Show more"}
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 