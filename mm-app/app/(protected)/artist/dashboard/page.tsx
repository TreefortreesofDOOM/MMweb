import { createClient } from '@/lib/supabase/server';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get artist's artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id, status')
    .eq('artist_id', user?.id);

  // Get artist's profile with type assertion
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('id', user?.id)
    .single();

  return <DashboardClient 
    artworks={artworks || []} 
    profile={{
      stripe_account_id: profile?.stripe_account_id,
      stripe_onboarding_complete: profile?.stripe_onboarding_complete
    }}
  />;
} 