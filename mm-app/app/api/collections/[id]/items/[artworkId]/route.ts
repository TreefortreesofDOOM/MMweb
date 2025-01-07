import { createClient } from '@/lib/supabase/supabase-server';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; artworkId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', params.id)
      .eq('artwork_id', params.artworkId)
      .eq('patron_id', user.id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing collection item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; artworkId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { notes } = await request.json();

    const { error } = await supabase
      .from('collection_items')
      .update({ notes })
      .eq('collection_id', params.id)
      .eq('artwork_id', params.artworkId)
      .eq('patron_id', user.id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error updating collection item notes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 