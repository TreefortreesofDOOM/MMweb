import { createClient } from '@/lib/supabase/supabase-server';
import { StoreManagementClient } from '@/components/store/store-management-client';
import { redirect } from 'next/navigation';

export default async function StorePage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get user roles from profile_roles view
  const { data: roleData, error: roleError } = await supabase
    .from('profile_roles')
    .select('mapped_role')
    .eq('id', user.id)
    .single();

  if (roleError || !roleData) {
    console.error('Error loading user roles:', roleError);
    return <div>Error loading user roles</div>;
  }

  // Check if user is a verified artist
  const isVerifiedArtist = roleData.mapped_role === 'verified_artist';

  if (!isVerifiedArtist) {
    return <div>Only verified artists can access the store</div>;
  }

  // Get store settings and artworks
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      stripe_account_id,
      stripe_onboarding_complete,
      store_settings!left (
        application_fee_percent
      )
    `)
    .eq('id', user.id)
    .single();

  const { data: artworks } = await supabase
    .from('artworks')
    .select(`
      id,
      title,
      images,
      store_products (
        id,
        status
      )
    `)
    .eq('artist_id', user.id);

  // Get the first store_settings record if it exists
  const storeSettings = Array.isArray(profile?.store_settings) 
    ? profile?.store_settings[0] 
    : profile?.store_settings;

  return (
    <StoreManagementClient
      storeSettings={{
        stripe_account_id: profile?.stripe_account_id,
        stripe_onboarding_complete: profile?.stripe_onboarding_complete || false,
        application_fee_percent: storeSettings?.application_fee_percent ?? 50
      }}
      artworks={artworks || []}
    />
  );
} 