import Hero from "@/components/hero";
import { createClient } from '@/lib/supabase/server';
import { ArtworkGallery } from '@/components/artwork/artwork-gallery';
import { GalleryAssistant } from '@/components/ai/gallery-assistant';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const supabase = await createClient();

  // Fetch published artworks with artist information
  const { data: artworks } = await supabase
    .from('artworks')
    .select(`
      *,
      profiles (
        id,
        name,
        bio
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(12);

  // Transform the data to match the component's expected format
  const transformedArtworks = artworks?.map(artwork => ({
    ...artwork,
    artist: artwork.profiles ? {
      id: artwork.profiles.id,
      name: artwork.profiles.name,
      bio: artwork.profiles.bio
    } : undefined
  })) || [];

  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-12 max-w-7xl mx-auto px-4 py-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Featured Artworks</h2>
          <p className="text-muted-foreground mb-6">
            Discover unique pieces from our talented artists
          </p>
          <ArtworkGallery artworks={transformedArtworks} />
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
