import { createClient } from '@/lib/supabase/supabase-server';
import { ArtworkForm } from '@/components/artwork/artwork-form';
import { notFound } from 'next/navigation';

export default async function NewArtworkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    notFound();
  }

  return <ArtworkForm userId={user.id} />;
} 