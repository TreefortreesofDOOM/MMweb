import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ArtworkForm } from '@/components/artwork/artwork-form';

export default async function NewArtworkPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'artist') {
    redirect('/profile');
  }

  return <ArtworkForm userId={user.id} />;
} 