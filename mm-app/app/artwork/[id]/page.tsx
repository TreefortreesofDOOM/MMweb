import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ArtworkQR } from '@/components/artwork/artwork-qr';

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: artwork } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!artwork) {
    return <div>Artwork not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{artwork.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Artwork details */}
          <p className="text-gray-600">{artwork.description}</p>
          <p className="text-xl font-semibold mt-4">${artwork.price / 100}</p>
        </div>
        <div>
          {/* QR Code section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Purchase In Gallery</h2>
            <ArtworkQR artworkId={artwork.id} title={artwork.title} />
          </div>
        </div>
      </div>
    </div>
  );
} 