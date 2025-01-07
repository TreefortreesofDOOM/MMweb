import { Suspense } from 'react'
import { listCollections } from '@/lib/actions/patron/collection-actions'
import { CollectionList, CollectionSkeleton } from '@/components/patron/collections/collection-list'
import { Alert, AlertDescription } from '@/components/ui/alert'

async function CollectionListWrapper() {
  try {
    const collections = await listCollections()
    return <CollectionList collections={collections} />
  } catch (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load collections: {(error as Error).message}
        </AlertDescription>
      </Alert>
    )
  }
}

export default function CollectionsPage() {
  return (
    <div className="container py-6">
      <Suspense fallback={<CollectionSkeleton />}>
        <CollectionListWrapper />
      </Suspense>
    </div>
  )
} 