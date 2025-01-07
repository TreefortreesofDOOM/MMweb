import type { FC } from 'react'
import { NewCollectionForm } from '@/components/patron/collections/new-collection-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Collection - Meaning Machine',
  description: 'Create a new collection to organize your favorite artworks.',
}

const NewCollectionPage: FC = () => {
  return (
    <div className="container max-w-2xl py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Collection</h1>
          <p className="text-muted-foreground">
            Create a new collection to organize your favorite artworks.
          </p>
        </div>
        <NewCollectionForm />
      </div>
    </div>
  )
}

export default NewCollectionPage 