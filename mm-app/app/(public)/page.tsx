import Hero from "@/components/hero";
import { createClient } from '@/lib/supabase/server';
import { ArtworkGallery } from '@/components/artwork/artwork-gallery';
import { GalleryAssistant } from '@/components/ai/gallery-assistant';
import { FeaturedArtist } from '@/components/featured-artist';
import { PageViewTracker } from '@/components/analytics/page-view-tracker';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();

  // Fetch featured artist
  const { data: featuredArtistData } = await supabase
    .from('featured_artist')
    .select(`
      *,
      artist:profiles!featured_artist_artist_id_fkey (
        id,
        name,
        bio,
        avatar_url
      )
    `)
    .eq('active', true)
    .single();

  // If no featured artist, get a random verified artist
  let featuredArtist = featuredArtistData?.artist;
  if (!featuredArtist) {
    const { data: randomArtist } = await supabase
      .from('profiles')
      .select('id, name, bio, avatar_url')
      .eq('role', 'verified_artist')
      .limit(1)
      .order('random()');
    
    featuredArtist = randomArtist?.[0];
  }

  // Fetch featured artist's artworks
  const { data: featuredArtworks } = await supabase
    .from('artworks')
    .select(`
      *,
      profiles (
        id,
        name,
        bio
      )
    `)
    .eq('artist_id', featuredArtist?.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6);

  // Fetch other published artworks
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
    .neq('artist_id', featuredArtist?.id)
    .order('created_at', { ascending: false })
    .limit(12);

  // Transform the artworks data
  const transformArtworks = (artworksData: any[]) => 
    artworksData?.map(artwork => ({
      ...artwork,
      artist: artwork.profiles ? {
        id: artwork.profiles.id,
        name: artwork.profiles.name,
        bio: artwork.profiles.bio
      } : undefined
    })) || [];

  const transformedFeaturedArtworks = transformArtworks(featuredArtworks || []);
  const transformedArtworks = transformArtworks(artworks || []);

  return (
    <>
      <PageViewTracker pathname="/" />
      <Hero />
      <main className="flex-1 flex flex-col gap-12 max-w-7xl mx-auto px-4 py-8">
        {featuredArtist && (
          <FeaturedArtist 
            artist={featuredArtist} 
            artworks={transformedFeaturedArtworks} 
          />
        )}

        <div>
          <h2 className="text-3xl font-bold mb-2">More Artworks</h2>
          <p className="text-muted-foreground mb-6">
            Discover unique pieces from our talented artists
          </p>
          <ArtworkGallery artworks={transformedArtworks} />
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-2">AI Gallery Assistant</h2>
          <p className="text-muted-foreground mb-6">
            Get personalized artwork recommendations
          </p>
          <GalleryAssistant />
        </div>
      </main>
    </>
  );
}
