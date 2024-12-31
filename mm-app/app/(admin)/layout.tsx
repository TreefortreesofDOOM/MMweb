import { type ReactNode, type ReactElement } from 'react';
import { createClient } from '@/lib/supabase/supabase-server';
import { redirect } from 'next/navigation';
import { RoleNav } from '@/components/nav/role-nav';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
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

  return (
    <div className="min-h-screen">
      <RoleNav role="admin">
        <main className="flex-1">
          {children}
        </main>
      </RoleNav>
    </div>
  );
} 