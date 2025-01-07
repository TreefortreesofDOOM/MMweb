import { createClient } from '@/lib/supabase/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { targetCollectionId, artworkIds } = await request.json();

    // Verify ownership of both collections
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id')
      .in('id', [params.id, targetCollectionId])
      .eq('patron_id', user.id);

    if (collectionsError || collections.length !== 2) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Move items
    const { error } = await supabase
      .from('collection_items')
      .update({ collection_id: targetCollectionId })
      .eq('collection_id', params.id)
      .in('artwork_id', artworkIds)
      .eq('patron_id', user.id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error moving collection items:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 