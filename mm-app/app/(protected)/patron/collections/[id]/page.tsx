import { createClient } from '@/lib/supabase/supabase-server';
import CollectionClient from './collection-client';
import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/actions/patron/collection-actions';

export default async function CollectionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const resolvedParams = await Promise.resolve(params);
  
  if (!resolvedParams?.id) {
    console.log('No collection ID provided');
    notFound();
  }

  try {
    const collection = await getCollection(resolvedParams.id);
    return <CollectionClient collection={collection} />;
  } catch (error) {
    console.error('Error fetching collection:', error);
    notFound();
  }
} 