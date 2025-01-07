import { getCollection } from '@/lib/actions/patron/collection-actions'
import { notFound } from 'next/navigation'
import { PublicCollectionView } from '@/components/patron/collections/public-collection-view'
import { Metadata, ResolvingMetadata } from 'next'

interface PublicCollectionPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata(
  { params }: PublicCollectionPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const collection = await getCollection(params.id)
    
    if (collection.is_private) {
      return {
        title: 'Collection Not Found',
      }
    }

    // Get the first artwork's image as the collection thumbnail
    const firstArtwork = collection.collection_items[0]?.artworks
    const thumbnailImage = firstArtwork?.images[0]?.url

    // Calculate total value for description
    const totalValue = collection.collection_items.reduce(
      (sum, item) => sum + (item.artworks.price || 0),
      0
    )

    const description = collection.description || 
      `A collection of ${collection.collection_items.length} artworks` +
      `${totalValue > 0 ? ` with a total value of $${totalValue.toLocaleString()}` : ''}`

    return {
      title: `${collection.name} | Art Collection on Meaning Machine`,
      description,
      openGraph: {
        title: collection.name,
        description,
        type: 'article',
        ...(thumbnailImage && {
          images: [{ url: thumbnailImage }],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: collection.name,
        description,
        ...(thumbnailImage && {
          images: [thumbnailImage],
        }),
      },
    }
  } catch {
    return {
      title: 'Collection Not Found',
    }
  }
}

export default async function PublicCollectionPage({ params }: PublicCollectionPageProps) {
  try {
    const collection = await getCollection(params.id)
    
    // If collection is private, return 404
    if (collection.is_private) {
      notFound()
    }

    return (
      <div className="container py-6">
        <PublicCollectionView collection={collection} />
      </div>
    )
  } catch (error) {
    notFound()
  }
} 