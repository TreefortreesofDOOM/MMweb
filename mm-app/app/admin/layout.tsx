'use client';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RoleNav } from '@/components/nav/role-nav';

export default async function AdminLayoutRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/sign-in');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return redirect('/profile');
  }

  return <RoleNav role="admin">{children}</RoleNav>;
} 