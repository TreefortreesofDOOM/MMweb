import { type ReactNode, type ReactElement } from 'react';
import { createClient } from '@/lib/supabase/supabase-server';
import { redirect } from 'next/navigation';
import { RoleNav } from '@/components/nav/role-nav';
import { UnifiedAIProvider } from '@/components/unified-ai/unified-ai-provider';
import { ArtistProvider } from '@/components/providers/artist-provider';

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

  // Get user profile with artist details
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, verificationProgress:verification_progress')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen">
      <UnifiedAIProvider>
        <ArtistProvider profile={profile}>
          <RoleNav role={profile?.role ?? 'user'}>
            {children}
          </RoleNav>
        </ArtistProvider>
      </UnifiedAIProvider>
    </div>
  );
} 