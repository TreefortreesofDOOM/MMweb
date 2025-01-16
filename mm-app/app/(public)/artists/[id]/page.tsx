import { createClient } from '@/lib/supabase/supabase-server';
import { notFound } from 'next/navigation';
import { ArtworkGallery } from '@/components/artwork/artwork-gallery';
import { Card, CardContent } from "@/components/ui/card";
import { PageViewTracker } from '@/components/analytics/page-view-tracker';
import { ARTIST_ROLES, type ArtistRole } from '@/lib/types/custom-types';
import { ArtistProfileCard } from '@/components/artist/artist-profile-card';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable static page generation

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ArtistPage({ params }: PageProps) {
  try {
    const supabase = await createClient();
    
    // Await params before using
    const { id } = await params;

    // Fetch artist profile
    const { data: profile, error: profileError } = await supabase
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

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

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
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks_with_artist')
      .select('*')
      .eq('artist_id', id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (artworksError) {
      console.error('Error fetching artworks:', artworksError);
      throw artworksError;
    }

    // Transform artworks data to match component's expected format
    const transformedArtworks = artworks?.map(artwork => ({
      ...artwork,
      artist: {
        id: artwork.artist_id,
        name: artwork.artist_name,
        bio: artwork.artist_bio,
        avatar_url: artwork.artist_avatar_url
      }
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
  } catch (error) {
    console.error('Error in ArtistPage:', error);
    notFound();
  }
} 