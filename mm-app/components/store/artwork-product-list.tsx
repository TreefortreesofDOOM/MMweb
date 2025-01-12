'use client'

import { type FC } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil, Plus, Store } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import type { Database } from '@/lib/types/database.types'

type Artwork = {
  id: string
  title: string
  images: {
    url: string
    width?: number
    height?: number
  }[]
  store_products: Array<{
    id: string
    status: string
  }> | null
}

interface ArtworkProductListProps {
  artworks: Artwork[]
  onAddToStore: (artworkId: string) => void
  onEditProduct: (artworkId: string, productId: string) => void
}

export const ArtworkProductListSkeleton: FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    ))}
  </div>
)

export const ArtworkProductList: FC<ArtworkProductListProps> = ({
  artworks,
  onAddToStore,
  onEditProduct,
}) => {
  if (!artworks.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No artworks found. Upload some artworks to start selling.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork) => {
        const storeProduct = artwork.store_products?.[0]
        const isInStore = !!storeProduct
        const imageUrl = artwork.images?.[0]?.url

        return (
          <Card key={artwork.id} className="overflow-hidden">
            <div className="relative aspect-square">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </div>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-semibold">{artwork.title}</h3>
              {isInStore && (
                <Badge variant={storeProduct.status === 'draft' ? 'secondary' : 'default'}>
                  {storeProduct.status}
                </Badge>
              )}
            </CardHeader>
            <CardFooter>
              {isInStore ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onEditProduct(artwork.id, storeProduct.id)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Product
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => onAddToStore(artwork.id)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Store
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
} 