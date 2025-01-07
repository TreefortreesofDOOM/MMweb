'use client';

import { CollectionDetail } from '@/components/patron/collections/collection-detail';
import type { CollectionWithItems } from '@/lib/types/patron-types';

interface CollectionClientProps {
  collection: CollectionWithItems;
}

export default function CollectionClient({ collection }: CollectionClientProps) {
  return (
    <div className="container py-6">
      <CollectionDetail 
        collection={collection} 
        isLoading={false}
      />
    </div>
  );
} 