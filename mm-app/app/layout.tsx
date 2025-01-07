import * as React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { SiteHeader } from '@/components/nav/site-header';
import { createClient } from '@/lib/supabase/supabase-server';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SettingsProvider } from '@/components/providers/settings-provider';
import { UnifiedAIProvider } from '@/lib/unified-ai/context';
import { UnifiedAI } from '@/components/unified-ai/unified-ai';
import { QueryProvider } from '@/components/providers/query-provider';
import { cn } from '@/lib/utils/common-utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MM Web',
  description: 'Art Gallery Platform',
  metadataBase: new URL('https://mmweb.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MM Web',
    description: 'Art Gallery Platform',
    locale: 'en_US',
    type: 'website',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = null;
  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, avatar_url')
      .eq('id', user.id)
      .single();
    userRole = profile?.role;
    userProfile = profile;
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      translate="no"
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="google" content="notranslate" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <ThemeProvider>
          {user ? (
            <SettingsProvider>
              <QueryProvider>
                <UnifiedAIProvider>
                  <div suppressHydrationWarning>
                    <SiteHeader
                      userRole={userRole}
                      userEmail={user.email}
                      userAvatarUrl={userProfile?.avatar_url}
                      userFullName={userProfile?.full_name}
                    />
                    <main>{children}</main>
                    <UnifiedAI />
                  </div>
                  <Toaster />
                </UnifiedAIProvider>
              </QueryProvider>
            </SettingsProvider>
          ) : (
            <>
              <div suppressHydrationWarning>
                <SiteHeader
                  userRole={null}
                  userEmail={null}
                  userAvatarUrl={null}
                  userFullName={null}
                />
                <main>{children}</main>
              </div>
              <Toaster />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
