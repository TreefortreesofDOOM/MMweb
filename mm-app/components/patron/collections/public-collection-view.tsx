'use client'

import { type FC, useEffect } from 'react'
import type { CollectionWithItems } from '@/lib/types/patron-types'
import { Card, CardContent } from '@/components/ui/card'
import { ArtworkCard } from '@/components/artwork/artwork-card'
import { CollectionStats } from './collection-stats'
import { formatDate } from '@/lib/utils/date-utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { trackCollectionView } from '@/lib/actions/patron/collection-analytics'
import { useSearchParams } from 'next/navigation'

interface PublicCollectionViewProps {
  collection: CollectionWithItems
}

export const PublicCollectionView: FC<PublicCollectionViewProps> = ({ collection }) => {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track the view when the component mounts
    trackCollectionView({
      collection_id: collection.id,
      source: searchParams.get('source') || 'direct',
      referrer: document.referrer || null,
    })
  }, [collection.id, searchParams])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/collections">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Button>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
        <p className="text-muted-foreground">
          Created {formatDate(collection.created_at)}
        </p>
      </div>

      {collection.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{collection.description}</p>
          </CardContent>
        </Card>
      )}

      <CollectionStats collectionId={collection.id} />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Artworks ({collection.collection_items.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {collection.collection_items.map((item) => (
            <Card key={item.artwork_id}>
              <CardContent className="p-4">
                <div className="relative">
                  <ArtworkCard
                    artwork={item.artworks}
                    showFavorite={false}
                  />
                </div>
                {item.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 