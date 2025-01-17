'use client'

import { type FC } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils/core/common-utils"
import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/core/common-utils"
import type { CollectionItem } from "@/lib/types/patron-types"

interface CollectionArtworkCardProps {
  artwork: CollectionItem['artworks']
  amount_paid: number | null
  onImageError?: () => void
  onImageLoad?: () => void
  onNavigate?: () => void
}

export const CollectionArtworkCard: FC<CollectionArtworkCardProps> = ({ 
  artwork, 
  amount_paid,
  onImageError,
  onImageLoad,
  onNavigate 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const images = artwork.images || []

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onNavigate?.()
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  const handleImageError = () => {
    setImageError(true)
    onImageError?.()
  }

  if (images.length === 0) {
    return (
      <Card 
        className="overflow-hidden"
        role="article"
        aria-label={`Artwork: ${artwork.title}`}
      >
        <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold truncate">{artwork.title}</h3>
            <p className="text-sm font-medium text-muted-foreground">
              {formatPrice(amount_paid ?? artwork.price ?? 0)}
            </p>
          </div>
          {artwork.profiles?.full_name && (
            <p className="text-sm text-muted-foreground mt-1">
              {artwork.profiles.full_name}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="overflow-hidden"
      role="article"
      aria-label={`Artwork: ${artwork.title}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="relative aspect-square">
        {imageError ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Image unavailable</span>
          </div>
        ) : (
          <Image
            src={images[currentImageIndex].url}
            alt={artwork.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={handleImageError}
            onLoad={onImageLoad}
          />
        )}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                previousImage()
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold truncate">{artwork.title}</h3>
          <p className="text-sm font-medium text-muted-foreground">
            {formatPrice(amount_paid ?? artwork.price ?? 0)}
          </p>
        </div>
        {artwork.profiles?.full_name && (
          <p className="text-sm text-muted-foreground mt-1">
            {artwork.profiles.full_name}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 