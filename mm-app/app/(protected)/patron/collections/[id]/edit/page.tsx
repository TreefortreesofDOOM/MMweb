import { EditCollectionForm } from '@/components/patron/collections/edit-collection-form'
import { getCollection } from '@/lib/actions/patron/collection-actions'
import { notFound } from 'next/navigation'

interface EditCollectionPageProps {
  params: Promise<{ id: string }> | { id: string }
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const resolvedParams = await Promise.resolve(params)
  
  if (!resolvedParams?.id) {
    console.log('No collection ID provided')
    notFound()
  }

  try {
    const collection = await getCollection(resolvedParams.id)
    return (
      <div className="container max-w-2xl py-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Edit Collection</h1>
            <p className="text-muted-foreground">
              Update your collection details.
            </p>
          </div>
          <EditCollectionForm collection={collection} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching collection:', error)
    notFound()
  }
} 