import { createClient } from '@/lib/supabase/server';
import ArtworksClient from './artworks-client';

export default async function ArtworksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get artist's artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', user?.id)
    .order('created_at', { ascending: false });

  return <ArtworksClient artworks={artworks || []} />;
} 