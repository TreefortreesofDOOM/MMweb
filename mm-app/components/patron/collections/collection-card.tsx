import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import type { CollectionWithCount } from '@/lib/types/patron-types'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { FC } from 'react'

interface CollectionCardProps {
  collection: CollectionWithCount;
  isPurchased?: boolean;
}

export const CollectionCard: FC<CollectionCardProps> = ({ 
  collection,
  isPurchased = false
}) => {
  const itemCount = collection.collection_items?.[0]?.count ?? 0;

  return (
    <Link href={`/patron/collections/${collection.id}`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold">{collection.name}</h3>
              {collection.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {collection.description}
                </p>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{itemCount} {itemCount === 1 ? 'artwork' : 'artworks'}</p>
              <p>Created {new Date(collection.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              {isPurchased && (
                <Badge variant="secondary" className="mt-2">
                  Purchased Works
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}; 