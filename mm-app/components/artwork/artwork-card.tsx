'use client';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ArtworkImage } from './artwork-upload';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArtworkCardProps {
  artwork: {
    id: string;
    title: string;
    price: number;
    status: string;
    images: ArtworkImage[];
  };
  showStatus?: boolean;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function ArtworkCard({ 
  artwork, 
  showStatus, 
  onPublish, 
  onUnpublish, 
  onDelete,
  isLoading 
}: ArtworkCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
            <p className="text-sm font-medium text-muted-foreground">{formatPrice(artwork.price)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-square">
        <Image
          src={sortedImages[currentImageIndex].url}
          alt={`${artwork.title} - Image ${currentImageIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-opacity duration-300"
        />
        {sortedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={previousImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {sortedImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-primary truncate">{artwork.title}</h3>
          <p className="text-sm font-medium text-muted-foreground">{formatPrice(artwork.price)}</p>
        </div>
        {showStatus && (
          <Badge variant={artwork.status === 'published' ? 'default' : 'secondary'} className="mb-2">
            {artwork.status}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Link href={`/artist/artworks/${artwork.id}/edit`} passHref>
          <Button variant="outline" className="w-full mr-2">Edit</Button>
        </Link>
        {showStatus && (
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
              disabled={isLoading}
              className="w-full ml-2"
            >
              Publish
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
} 