import { createClient } from '@/lib/supabase/supabase-server';
import { FeaturedArtistManager } from '@/components/admin/featured-artist-manager';

export const dynamic = 'force-dynamic';

export default async function FeaturedArtistPage() {
  const supabase = await createClient();

  // Fetch current featured artist
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

  // Fetch all verified artists
  const { data: verifiedArtists } = await supabase
    .from('profiles')
    .select('id, name, bio, avatar_url')
    .eq('role', 'verified_artist')
    .order('name');

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Featured Artist Management</h1>
      </div>
      <div className="max-w-4xl">
        <FeaturedArtistManager
          currentFeaturedArtist={featuredArtistData?.artist}
          verifiedArtists={verifiedArtists || []}
        />
      </div>
    </div>
  );
} 