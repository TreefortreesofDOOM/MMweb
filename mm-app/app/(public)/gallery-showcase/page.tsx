import { createClient } from '@/lib/supabase/supabase-server';
import { PageViewTracker } from '@/components/analytics/page-view-tracker';
import { notFound } from 'next/navigation';
import { GalleryClient } from './gallery-client';
import { FeaturedArtist } from '@/components/artist/featured-artist';
import { ArtistProfileCard } from '@/components/artist/artist-profile-card';
import type { ArtistRole } from '@/lib/types/custom-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ARTWORKS_PER_PAGE = 12;

export default async function GalleryPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch featured artist
    const { data: featuredArtistData } = await supabase
      .from('featured_artist')
      .select(`
        *,
        artist:profiles!featured_artist_artist_id_fkey (
          id,
          full_name,
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
        .select('id, full_name, bio, avatar_url')
        .eq('role', 'verified_artist')
        .limit(1)
        .order('random()');
      
      featuredArtist = randomArtist?.[0];
    }

    // Fetch featured artist's artworks
    const { data: featuredArtworks } = await supabase
      .from('artworks_with_artist')
      .select('*')
      .eq('artist_id', featuredArtist?.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(6);

    // Transform the featured artworks data
    const transformArtworks = (artworksData: any[]) => 
      artworksData?.map(artwork => ({
        ...artwork,
        artist: {
          id: artwork.artist_id,
          name: artwork.artist_full_name || artwork.artist_name,
          bio: artwork.artist_bio,
          avatar_url: artwork.artist_avatar_url
        }
      })) || [];

    const transformedFeaturedArtworks = transformArtworks(featuredArtworks || []);

    // Transform the featured artist data
    const transformedFeaturedArtist = featuredArtist ? {
      id: featuredArtist.id,
      full_name: featuredArtist.full_name,
      avatar_url: featuredArtist.avatar_url,
      bio: featuredArtist.bio,
      website: null,
      instagram: null,
      location: null,
      artist_type: 'verified_artist' as ArtistRole,
      medium: []
    } : null;

    // Fetch initial published artworks with artist information
    const { data: artworks, error } = await supabase
      .from('artworks_with_artist')
      .select('*')
      .eq('status', 'published')
      .neq('artist_id', featuredArtist?.id)
      .order('created_at', { ascending: false })
      .range(0, ARTWORKS_PER_PAGE - 1);

    if (error) {
      console.error('Error fetching artworks:', error);
      throw error;
    }

    // Transform the gallery artworks data
    const transformedArtworks = transformArtworks(artworks || []);

    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <PageViewTracker pathname="/gallery-showcase" />
        <div className="space-y-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gallery</h1>
            <p className="text-muted-foreground mb-6">
              Meaning Machine is a curated collection of artworks by exhibiting and emerging artists.
            </p>
          </div>

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
            <h2 className="text-2xl font-bold mb-6">Gallery Showcase</h2>
            <GalleryClient 
              initialArtworks={transformedArtworks} 
              featuredArtistId={featuredArtist?.id || null} 
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in GalleryPage:', error);
    notFound();
  }
} 