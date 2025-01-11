'use client'

import type { FC } from 'react'
import type { CollectionWithItems } from '@/lib/types/patron-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, Lock, Globe } from 'lucide-react'
import Link from 'next/link'
import { CollectionItemGrid } from './collection-item-grid'
import { CollectionPrivacySettings } from './collection-privacy-settings'
import { CollectionStats } from './collection-stats'
import { CollectionShareDialog } from './collection-share-dialog'
import { BatchOperationsMenu } from './batch-operations-menu'
import { MoveItemsDialog } from './move-items-dialog'
import { BulkNotesDialog } from './bulk-notes-dialog'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCollection } from '@/hooks/use-collection'

const CollectionDetailSkeleton: FC = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  </div>
)

interface CollectionDetailErrorProps {
  error: Error
}

const CollectionDetailError: FC<CollectionDetailErrorProps> = ({ error }) => (
  <Alert variant="destructive">
    <AlertDescription>
      Failed to load collection: {error.message}
    </AlertDescription>
  </Alert>
)

interface CollectionDetailContentProps {
  collection: CollectionWithItems
}

const CollectionDetailContent: FC<CollectionDetailContentProps> = ({ collection }) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const { removeItem, moveItems, updateNotes, isLoading } = useCollection()

  const handleRemoveItems = async () => {
    const itemIds = Array.from(selectedItems)
    try {
      await Promise.all(
        itemIds.map(id => removeItem(collection.id, id))
      )
      setSelectedItems(new Set())
    } catch (error) {
      console.error('Error removing items:', error)
    }
  }

  const handleMoveItems = async (targetCollectionId: string) => {
    const itemIds = Array.from(selectedItems)
    try {
      await moveItems(collection.id, targetCollectionId, itemIds)
      setSelectedItems(new Set())
      setIsMoveDialogOpen(false)
    } catch (error) {
      console.error('Error moving items:', error)
    }
  }

  const handleUpdateNotes = async (notes: string) => {
    const itemIds = Array.from(selectedItems)
    try {
      await Promise.all(
        itemIds.map(id => updateNotes(collection.id, id, notes))
      )
      setSelectedItems(new Set())
      setIsNotesDialogOpen(false)
    } catch (error) {
      console.error('Error updating notes:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
            {collection.is_private ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Created {new Date(collection.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BatchOperationsMenu
            selectedCount={selectedItems.size}
            onRemove={handleRemoveItems}
            onMove={() => setIsMoveDialogOpen(true)}
            onUpdateNotes={() => setIsNotesDialogOpen(true)}
          />
          <CollectionShareDialog
            collectionId={collection.id}
            collectionName={collection.name}
            isPrivate={collection.is_private ?? false}
          />
          <CollectionPrivacySettings
            collectionId={collection.id}
            isPrivate={collection.is_private ?? false}
          />
          <Link href={`/patron/collections/${collection.id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Collection
            </Button>
          </Link>
        </div>
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Artworks ({collection.collection_items.length})
          </h2>
          <Button>Add Artwork</Button>
        </div>

        {collection.collection_items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No artworks in this collection yet. Add some artworks to get started.
            </p>
          </div>
        ) : (
          <CollectionItemGrid 
            collectionId={collection.id}
            items={collection.collection_items}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
          />
        )}
      </div>

      <MoveItemsDialog
        isOpen={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
        onMove={handleMoveItems}
        currentCollectionId={collection.id}
        itemCount={selectedItems.size}
      />

      <BulkNotesDialog
        isOpen={isNotesDialogOpen}
        onClose={() => setIsNotesDialogOpen(false)}
        onUpdate={handleUpdateNotes}
        itemCount={selectedItems.size}
      />
    </div>
  )
}

interface CollectionDetailProps {
  collection: CollectionWithItems
  isLoading?: boolean
  error?: Error
}

export const CollectionDetail: FC<CollectionDetailProps> = ({ 
  collection,
  isLoading,
  error
}) => {
  if (isLoading) return <CollectionDetailSkeleton />
  if (error) return <CollectionDetailError error={error} />
  
  return <CollectionDetailContent collection={collection} />
} 