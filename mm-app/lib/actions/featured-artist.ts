'use server';

import { createClient } from '@/lib/supabase/supabase-server';
import { revalidatePath } from 'next/cache';

export async function setFeaturedArtist(artistId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .rpc('set_featured_artist', { artist_id: artistId });

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/featured-artist');
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error setting featured artist:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to set featured artist' 
    };
  }
}

export async function removeFeaturedArtist() {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('featured_artist')
      .update({ active: false })
      .eq('active', true);

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/featured-artist');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error removing featured artist:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to remove featured artist' 
    };
  }
} 