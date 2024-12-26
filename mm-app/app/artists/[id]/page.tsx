import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ArtworkGallery } from '@/components/artwork/artwork-gallery';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 3600; // Revalidate every hour

interface PageProps {
  params: { id: string };
}

export default async function ArtistPage({ params }: PageProps) {
  const supabase = await createClient();

  // Fetch artist profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'artist')
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch artist's published artworks
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
    .eq('artist_id', params.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Transform artworks data to match component's expected format
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
      <div className="space-y-8">
        {/* Artist Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{profile.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.bio && (
              <div>
                <h2 className="text-lg font-semibold mb-2">About the Artist</h2>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}
            <div className="space-y-2">
              {profile.website && (
                <p>
                  <span className="font-medium">Website: </span>
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profile.website}
                  </a>
                </p>
              )}
              {profile.instagram && (
                <p>
                  <span className="font-medium">Instagram: </span>
                  <a 
                    href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profile.instagram}
                  </a>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Artist's Artworks */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Artworks by {profile.name}</h2>
          <ArtworkGallery artworks={transformedArtworks} />
        </div>
      </div>
    </div>
  );
} 