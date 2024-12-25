import { createClient } from '@/lib/supabase/server';
import { ArtworkGrid } from '@/components/artwork/artwork-grid';
import { GalleryAssistant } from '@/components/ai/gallery-assistant';

export const revalidate = 3600; // Revalidate every hour

export default async function GalleryPage() {
  const supabase = await createClient();

  // Fetch published artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select(`
      *,
      profiles (
        name
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gallery</h1>
          <p className="text-muted-foreground mb-6">
            Discover unique pieces from our talented artists
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          <div>
            <ArtworkGrid artworks={artworks || []} />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <GalleryAssistant />
          </div>
        </div>
      </div>
    </div>
  );
} 