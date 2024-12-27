import { type ReactNode, type ReactElement } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RoleNav } from '@/components/nav/role-nav';

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/sign-in');
  }

  // Get user role for conditional rendering
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen">
      <RoleNav role={profile?.role ?? 'user'}>
        <main className="flex-1">
          {children}
        </main>
      </RoleNav>
    </div>
  );
} 