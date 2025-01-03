import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { SiteHeader } from '@/components/nav/site-header';
import { createClient } from '@/lib/supabase/supabase-server';
import { ThemeProvider } from 'next-themes';
import { FloatingAssistantProvider } from '@/components/providers/floating-assistant-provider';
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
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role;
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FloatingAssistantProvider>
            <div suppressHydrationWarning>
              <SiteHeader userRole={userRole} userEmail={user?.email} />
              <main>{children}</main>
            </div>
            <Toaster />
          </FloatingAssistantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
