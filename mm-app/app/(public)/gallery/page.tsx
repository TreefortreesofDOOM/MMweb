import { createClient } from '@/lib/supabase/supabase-server';
import { ArtworkGallery } from '@/components/artwork/artwork-gallery';
import { GalleryAssistant } from '@/components/ai/gallery-assistant';
import { PageViewTracker } from '@/components/analytics/page-view-tracker';

export const revalidate = 3600; // Revalidate every hour

export default async function GalleryPage() {
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
    .order('created_at', { ascending: false });

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
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <PageViewTracker pathname="/gallery" />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gallery</h1>
          <p className="text-muted-foreground mb-6">
            Meaning Machine is a curated collection of artworks by exhibiting and emerging artists.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          <div>
            <ArtworkGallery artworks={transformedArtworks} />
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