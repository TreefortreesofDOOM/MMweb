import { createClient } from '@/lib/supabase/supabase-server';
import DashboardClient from '@/components/patron/dashboard/dashboard-client';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get patron's collections
  const { data: collections } = await supabase
    .from('collections')
    .select('id, name, is_private, created_at')
    .eq('patron_id', user?.id);

  // Get patron's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user?.id)
    .single();

  return <DashboardClient 
    collections={collections || []} 
    profile={profile || { id: user?.id, role: 'patron' }}
  />;
} 