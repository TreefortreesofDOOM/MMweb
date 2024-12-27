import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ArtworkForm } from '@/components/artwork/artwork-form';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditArtworkPage({ params }: PageProps) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Await params before using
  const { id } = await params;

  // Get artwork and verify ownership
  const { data: artwork } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', id)
    .eq('artist_id', user.id)
    .single();

  if (!artwork) {
    redirect('/artist/artworks');
  }

  return <ArtworkForm artwork={artwork} userId={user.id} />;
} 