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
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  // If artworks exist but none have display_order set, sort by created_at
  const sortedArtworks = artworks?.every(a => a.display_order === null) 
    ? artworks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : artworks;

  return <ArtworksClient artworks={sortedArtworks || []} />;
} 