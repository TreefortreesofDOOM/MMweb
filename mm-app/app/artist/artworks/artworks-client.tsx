'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArtworkCard } from "@/components/artwork/artwork-card";
import { publishArtwork, unpublishArtwork } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface ArtworksClientProps {
  artworks: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    images: Array<{
      url: string;
      isPrimary: boolean;
      order: number;
    }>;
  }>;
}

export default function ArtworksClient({ artworks: initialArtworks }: ArtworksClientProps) {
  const [artworks, setArtworks] = useState(initialArtworks);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handlePublish(id: string) {
    setIsLoading(id);
    try {
      const result = await publishArtwork(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        // Update local state
        setArtworks(artworks.map(artwork => 
          artwork.id === id 
            ? { ...artwork, status: 'published' }
            : artwork
        ));
        toast.success('Artwork published successfully');
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to publish artwork');
    } finally {
      setIsLoading(null);
    }
  }

  async function handleUnpublish(id: string) {
    setIsLoading(id);
    try {
      const result = await unpublishArtwork(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        // Update local state
        setArtworks(artworks.map(artwork => 
          artwork.id === id 
            ? { ...artwork, status: 'draft' }
            : artwork
        ));
        toast.success('Artwork unpublished successfully');
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to unpublish artwork');
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Artworks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your artwork collection
          </p>
        </div>
        <Button asChild>
          <Link href="/artist/artworks/new">Add New Artwork</Link>
        </Button>
      </div>

      {artworks?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            You haven't added any artworks yet.
          </p>
          <Button asChild className="mt-4">
            <Link href="/artist/artworks/new">
              Add Your First Artwork
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks?.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              showStatus
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              isLoading={isLoading === artwork.id}
            />
          ))}
        </div>
      )}
    </div>
  );
} 