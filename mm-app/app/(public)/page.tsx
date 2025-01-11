import Hero from "@/components/ui/hero";
import { createClient } from '@/lib/supabase/supabase-server';
import { ArtworkGallery } from '@/components/artwork/artwork-gallery';
import { FeaturedArtist } from '@/components/artist/featured-artist';
import { PageViewTracker } from '@/components/analytics/page-view-tracker';
import { ArtistProfileCard } from '@/components/artist/artist-profile-card';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch featured artist
  const { data: featuredArtistData } = await supabase
    .from('featured_artist')
    .select(`
      *,
      artist:profiles!featured_artist_artist_id_fkey (
        id,
        name: full_name,
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
        bio,
        avatar_url
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
        bio,
        avatar_url
      )
    `)
    .eq('status', 'published')
    .neq('artist_id', featuredArtist?.id)
    .eq('ai_generated', false)
    .order('created_at', { ascending: false })
    .limit(12);

  // Transform the artworks data
  const transformArtworks = (artworksData: any[]) => 
    artworksData?.map(artwork => ({
      ...artwork,
      artist: artwork.profiles ? {
        id: artwork.profiles.id,
        name: artwork.profiles.name,
        bio: artwork.profiles.bio,
        avatar_url: artwork.profiles.avatar_url
      } : undefined
    })) || [];

  const transformedFeaturedArtworks = transformArtworks(featuredArtworks || []);
  const transformedArtworks = transformArtworks(artworks || []);

  // Transform the featured artist data to match ArtistProfileCard interface
  const transformedFeaturedArtist = featuredArtist ? {
    id: featuredArtist.id,
    full_name: featuredArtist.name,
    avatar_url: featuredArtist.avatar_url,
    bio: featuredArtist.bio,
    website: null,
    instagram: null,
    location: null,
    artist_type: 'verified' as const,
    medium: []
  } : null;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <PageViewTracker pathname="/" />
      <Hero />
      <main className="flex-1 flex flex-col gap-12 max-w-7xl mx-auto px-4 py-8">
        {transformedFeaturedArtist && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Featured Artist</h2>
              <ArtistProfileCard artist={transformedFeaturedArtist} />
            </div>
            <FeaturedArtist 
              artist={featuredArtist} 
              artworks={transformedFeaturedArtworks} 
            />
          </div>
        )}

        <div>
          <h2 className="text-3xl font-bold mb-2">More Artworks</h2>
          <p className="text-muted-foreground mb-6">
            Discover unique pieces from our talented artists
          </p>
          <ArtworkGallery artworks={transformedArtworks} />
        </div>
      </main>
    </div>
  );
}
