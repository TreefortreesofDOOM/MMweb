import { createClient } from '@/lib/supabase/supabase-server';
import { NextResponse } from 'next/server';

interface OrderItem {
  id: string
  order: number
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { items } = await request.json();

    // Verify collection ownership
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', params.id)
      .eq('patron_id', user.id)
      .single();

    if (collectionError || !collection) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update items order
    const { error } = await supabase
      .from('collection_items')
      .upsert(
        items.map(({ id, order }: OrderItem) => ({
          id,
          display_order: order,
          collection_id: params.id,
          patron_id: user.id,
        }))
      );

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error updating collection item order:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 