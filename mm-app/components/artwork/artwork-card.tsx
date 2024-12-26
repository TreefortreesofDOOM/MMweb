'use client';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ArtworkImage } from './artwork-upload';

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
  
  // Get primary image first, then other images, filter out any images with empty URLs
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

  // If no valid images, show a placeholder
  if (sortedImages.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{artwork.title}</h3>
            <p className="text-sm">{formatPrice(artwork.price)}</p>
          </div>
          {showStatus && (
            <Badge
              variant={artwork.status === 'published' ? 'default' : 'secondary'}
              className="mt-2"
            >
              {artwork.status}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square">
        <Image
          src={sortedImages[currentImageIndex].url}
          alt={artwork.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        {sortedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={previousImage}
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={nextImage}
            >
              →
            </Button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {sortedImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{artwork.title}</h3>
          <p className="text-sm">{formatPrice(artwork.price)}</p>
        </div>
        {showStatus && (
          <Badge
            variant={artwork.status === 'published' ? 'default' : 'secondary'}
            className="mt-2"
          >
            {artwork.status}
          </Badge>
        )}
      </CardContent>
      {(onPublish || onUnpublish || onDelete) && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          {artwork.status === 'draft' && (
            <>
              {onPublish && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onPublish(artwork.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Publishing...' : 'Publish'}
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                asChild
              >
                <Link href={`/artist/artworks/${artwork.id}/edit`}>
                  Edit
                </Link>
              </Button>
            </>
          )}
          {artwork.status === 'published' && onUnpublish && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUnpublish(artwork.id)}
              disabled={isLoading}
            >
              {isLoading ? 'Unpublishing...' : 'Unpublish'}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(artwork.id)}
              disabled={isLoading}
            >
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
} 