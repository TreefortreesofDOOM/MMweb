import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RoleNav } from '@/components/nav/role-nav';

export default async function ArtistLayoutRoot({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return <RoleNav role="artist">{children}</RoleNav>;
} 