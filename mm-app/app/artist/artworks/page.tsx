import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ArtworksClient from './artworks-client';

export default async function ArtworksPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/sign-in');
  }

  // Check if user is artist
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'artist') {
    return redirect('/profile');
  }

  // Get artist's artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', user.id)
    .order('created_at', { ascending: false });

  return <ArtworksClient artworks={artworks || []} />;
} 