'use client'

import type { FC } from 'react'
import type { CollectionWithCount } from '@/lib/types/patron-types'
import { CollectionCard } from './collection-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export const CollectionSkeleton: FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  </div>
)

interface CollectionListProps {
  collections: CollectionWithCount[]
}

export const CollectionList: FC<CollectionListProps> = ({ collections }) => {
  const purchasedCollection = collections.find(c => c.is_purchased);
  const customCollections = collections.filter(c => !c.is_purchased);

  return (
    <div className="space-y-8">
      {purchasedCollection && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Art Collection</h2>
          <CollectionCard 
            key={purchasedCollection.id} 
            collection={purchasedCollection}
            isPurchased
          />
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">My Collections</h2>
          <Link href="/patron/collections/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </Link>
        </div>
        
        {customCollections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No collections yet. Create your first collection to start organizing your art.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customCollections.map((collection) => (
              <CollectionCard 
                key={collection.id} 
                collection={collection}
                isPurchased={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 