import Hero from "@/components/hero";
import { createClient } from '@/lib/supabase/server';
import { ArtworkGrid } from '@/components/artwork/artwork-grid';
import { GalleryAssistant } from '@/components/ai/gallery-assistant';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const supabase = await createClient();

  // Fetch published artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-12 max-w-7xl mx-auto px-4 py-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Featured Artworks</h2>
          <p className="text-muted-foreground mb-6">
            Discover unique pieces from our talented artists
          </p>
          <ArtworkGrid artworks={artworks || []} />
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-2">AI Gallery Assistant</h2>
          <p className="text-muted-foreground mb-6">
            Get personalized help exploring our collection
          </p>
          <GalleryAssistant />
        </div>
      </main>
    </>
  );
}
