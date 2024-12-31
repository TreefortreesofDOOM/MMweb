import { createClient } from '@/lib/supabase/supabase-server';
import { notFound } from 'next/navigation';
import { ArtworkGallery } from '@/components/artwork/artwork-gallery';
import { Card, CardContent } from "@/components/ui/card";
import { PageViewTracker } from '@/components/analytics/page-view-tracker';
import { ARTIST_ROLES, type ArtistRole } from '@/lib/types/custom-types';
import { ArtistProfileCard } from '@/components/artist/artist-profile-card';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ArtistPage({ params }: PageProps) {
  const supabase = await createClient();
  
  // Await params before using
  const { id } = await params;

  // Fetch artist profile
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      avatar_url,
      bio,
      website,
      instagram,
      location,
      role,
      medium
    `)
    .eq('id', id)
    .single();

  if (!profile) {
    notFound();
  }

  // Transform profile to match ArtistProfileCard interface
  const artistProfile = {
    ...profile,
    artist_type: (profile.role === 'verified_artist' ? 'verified' : 'emerging') as ArtistRole,
    medium: profile.medium || []
  };

  // Fetch artist's published artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select(`
      *,
      profiles (
        id,
        full_name,
        bio
      )
    `)
    .eq('artist_id', id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Transform artworks data to match component's expected format
  const transformedArtworks = artworks?.map(artwork => ({
    ...artwork,
    artist: artwork.profiles ? {
      id: artwork.profiles.id,
      name: artwork.profiles.full_name,
      bio: artwork.profiles.bio
    } : undefined
  })) || [];

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <PageViewTracker pathname={`/artists/${id}`} />
      <div className="space-y-8">
        <ArtistProfileCard 
          artist={artistProfile} 
          isPublicRoute={true}
        />

        {/* Artist's Artworks */}
        {transformedArtworks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Artworks</h2>
            <ArtworkGallery artworks={transformedArtworks} />
          </div>
        )}
      </div>
    </div>
  );
} 