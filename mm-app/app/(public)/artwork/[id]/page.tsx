import { createClient } from '@/lib/supabase/supabase-server';
import { ArtworkQR } from '@/components/artwork/artwork-qr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils/common-utils';
import { PageViewTracker } from '@/components/analytics/page-view-tracker';
import { FavoriteButton } from '@/components/social';

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: artwork } = await supabase
    .from('artworks')
    .select(`
      *,
      profiles (
        name,
        bio,
        avatar_url
      )
    `)
    .eq('id', params.id)
    .single();

  if (!artwork) {
    return <div>Artwork not found</div>;
  }

  // Get primary image
  const primaryImage = artwork.images.find((img: any) => img.isPrimary);
  const imageUrl = primaryImage?.url || artwork.images[0]?.url;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <PageViewTracker pathname={`/artwork/${params.id}`} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Artwork Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={artwork.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>

        {/* Right Column - Details and AI Assistant */}
        <div className="space-y-8">
          {/* Artwork Details */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{artwork.title}</h1>
            <div className="space-y-2">
              <p className="text-2xl font-semibold">{formatPrice(artwork.price)}</p>
              <p className="text-muted-foreground">By {artwork.profiles.name}</p>
              <FavoriteButton 
                artworkId={artwork.id} 
                variant="ghost" 
                onToggle={() => {}} 
              />
            </div>
            <p className="text-muted-foreground">{artwork.description}</p>
          </div>

          {/* Artist Bio */}
          {artwork.profiles.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About the Artist</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{artwork.profiles.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* QR Code for In-Gallery Purchase */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase In Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <ArtworkQR artworkId={artwork.id} title={artwork.title} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Art Advisor Section */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>About This Artwork</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This artwork is now integrated with our new unified AI assistant system. Click the floating button at the bottom right of your screen to get insights about this piece.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 