import { createClient } from '@/lib/supabase/supabase-server';
import { Database } from '../types/database.types';

export async function getProfile() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return profile;
} 