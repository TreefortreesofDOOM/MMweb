import { createClient } from '@/lib/supabase/supabase-server';
import { ArtworkGallery } from '@/components/artwork/artwork-gallery';
import { PageViewTracker } from '@/components/analytics/page-view-tracker';
import { ArtworkCard } from '@/components/artwork/artwork-card';

export const revalidate = 3600; // Revalidate every hour

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch published artworks with artist information
  const { data: artworks } = await supabase
    .from('artworks')
    .select(`
      *,
      profiles (
        id,
        name,
        bio,
        avatar_url
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
      bio: artwork.profiles.bio,
      avatar_url: artwork.profiles.avatar_url
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
        </div>
      </div>
    </div>
  );
} 