'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{artwork.title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative h-full flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-1/2 h-[40vh] md:h-full">
            <Image
              src={primaryImage.url}
              alt={artwork.title}
              fill
              className="object-cover"
              priority
            />
            
            {/* Navigation buttons */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 text-white hover:bg-black/70"
                onClick={handlePrevious}
                aria-label="Previous artwork"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 text-white hover:bg-black/70"
                onClick={handleNext}
                aria-label="Next artwork"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">{artwork.title}</CardTitle>
                  {artwork.artist?.name && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground">by {artwork.artist.name}</p>
                      {artwork.artist.id && (
                        <Link 
                          href={`/artists/${artwork.artist.id}`}
                          className="inline-flex items-center text-sm text-primary hover:underline"
                          onClick={onClose}
                        >
                          View all works by this artist →
                        </Link>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div>
                    <p className="text-2xl font-semibold">{formatPrice(artwork.price)}</p>
                    {artwork.description && (
                      <p className="text-muted-foreground mt-2">{artwork.description}</p>
                    )}
                  </div>

                  {artwork.artist?.bio && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">About the Artist</h3>
                      <p className="text-muted-foreground">{artwork.artist.bio}</p>
                    </div>
                  )}

                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Artwork {currentIndex + 1} of {artworks.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 