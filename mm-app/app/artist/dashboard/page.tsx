import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './dashboard-client';

export default async function ArtistDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Get user profile with Stripe info
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, stripe_account_id, stripe_onboarding_complete')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'artist') {
    redirect('/');
  }

  return <DashboardClient profile={profile} />;
} 