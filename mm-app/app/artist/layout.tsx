import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default async function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/sign-in');
  }

  // Check if user is artist
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'artist') {
    return redirect('/profile');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-muted p-6 border-r">
        <div className="space-y-4">
          <div className="mb-8">
            <h2 className="text-lg font-semibold">Artist Dashboard</h2>
            <p className="text-sm text-muted-foreground">Manage your artworks</p>
          </div>
          <nav className="space-y-2">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/artist/dashboard">
                Overview
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/artist/artworks">
                My Artworks
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/artist/artworks/new">
                Upload New Artwork
              </Link>
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 