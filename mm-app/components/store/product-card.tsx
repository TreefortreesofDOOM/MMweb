'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GalleryBadge } from '@/components/gallery/ui/badge';
import type { GalleryWallType } from '@/lib/types/gallery-types';

interface ArtworkImage {
  url: string;
  isPrimary?: boolean;
  order?: number;
}

interface ProductCardProps {
  artwork: {
    id: string;
    title: string;
    images: ArtworkImage[] | { main: string };
    gallery_wall_type?: GalleryWallType;
    gallery_price?: number;
  };
  product?: {
    is_variable_price: boolean;
    min_price?: number;
    gallery_price?: number;
    metadata?: {
      recommended_price?: number;
    };
  };
}

export function ProductCard({ artwork, product }: ProductCardProps) {
  const isTrustWall = artwork.gallery_wall_type === 'trust_wall';
  const price = isTrustWall ? product?.min_price : (product?.gallery_price || artwork.gallery_price);
  const recommendedPrice = product?.metadata?.recommended_price;

  const imageUrl = Array.isArray(artwork.images) 
    ? artwork.images[0]?.url 
    : (artwork.images as { main: string }).main;

  return (
    <Card className="overflow-hidden">
      {/* Artwork Image */}
      <div className="relative aspect-square">
        <img
          src={imageUrl}
          alt={artwork.title}
          className="object-cover w-full h-full"
        />
      </div>

      <CardContent className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-medium truncate">{artwork.title}</h3>

        {/* Wall Type */}
        {artwork.gallery_wall_type && (
          <div>
            <GalleryBadge wallType={artwork.gallery_wall_type} />
          </div>
        )}

        {/* Price Information */}
        <div className="space-y-1">
          {isTrustWall ? (
            <>
              <p className="text-sm">Starting at {formatPrice(price)}</p>
              {recommendedPrice && (
                <p className="text-sm text-muted-foreground">
                  Recommended: {formatPrice(recommendedPrice)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm font-medium">{formatPrice(price)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatPrice(price?: number) {
  if (!price) return 'Price not set';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
} 