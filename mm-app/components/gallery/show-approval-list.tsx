'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/supabase-client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { GalleryShowWithDetails } from '@/lib/types/gallery-types';
import type { Database } from '@/lib/types/database.types';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { useState } from 'react';

interface ArtworkImage {
  url: string;
  isPrimary?: boolean;
  order?: number;
}

type ArtworkImages = ArtworkImage[] | { thumbnail?: string; main: string };
type ShowStatus = 'pending' | 'approved' | 'rejected';

const getArtworkImageUrl = (images: ArtworkImages): string => {
  if (Array.isArray(images)) {
    const primaryImage = images.find(img => img.isPrimary) || images[0];
    return primaryImage?.url || '';
  } else {
    return images.thumbnail || images.main;
  }
};

export const ShowApprovalList = () => {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient();
  const [status, setStatus] = useState<ShowStatus>('pending');

  const { data: shows, isLoading } = useQuery({
    queryKey: ['gallery-shows', status],
    queryFn: async () => {
      const { data } = await supabase
        .from('gallery_shows')
        .select(`
          *,
          created_by_profile:profiles!gallery_shows_created_by_fkey(*),
          approved_by_profile:profiles!gallery_shows_approved_by_fkey(*),
          artworks:gallery_show_artworks!inner(
            artwork:artworks!inner(
              *,
              artist:profiles!artworks_artist_id_fkey(*)
            )
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });
      return data as GalleryShowWithDetails[];
    }
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ showId, newStatus }: { showId: string; newStatus: ShowStatus }) => {
      const response = await fetch('/api/gallery/shows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ showId, status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update show status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-shows'] });
      toast.success('Show status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update show status');
    }
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading shows...</div>;
  }

  const renderShows = () => {
    if (!shows?.length) {
      return <div className="text-sm text-muted-foreground">No {status} shows found.</div>;
    }

    return (
      <div className="space-y-6">
        {shows.map((show) => (
          <div
            key={show.id}
            className="border rounded-lg p-4 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{show.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(show.start_date).toLocaleDateString()} - {new Date(show.end_date).toLocaleDateString()}
                </p>
                {show.created_by_profile && (
                  <p className="text-sm text-muted-foreground">
                    Created by: {show.created_by_profile.name}
                  </p>
                )}
                {status === 'approved' && show.approved_by_profile && (
                  <p className="text-sm text-muted-foreground">
                    Approved by: {show.approved_by_profile.name} on {new Date(show.approved_at!).toLocaleDateString()}
                  </p>
                )}
              </div>
              {status === 'pending' && (
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus({ showId: show.id, newStatus: 'rejected' })}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateStatus({ showId: show.id, newStatus: 'approved' })}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>

            {/* Artwork Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {show.artworks?.map(({ artwork }) => {
                const imageUrl = getImageUrl(getArtworkImageUrl(artwork.images as ArtworkImages));
                
                return (
                  <div key={artwork.id} className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={imageUrl}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                      <p className="text-xs text-white truncate">{artwork.artist.name}</p>
                      <p className="text-xs text-white/80 truncate">{artwork.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="pending" onValueChange={(value) => setStatus(value as ShowStatus)}>
      <TabsList>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
      </TabsList>
      <TabsContent value="pending" className="mt-6">
        {renderShows()}
      </TabsContent>
      <TabsContent value="approved" className="mt-6">
        {renderShows()}
      </TabsContent>
    </Tabs>
  );
}; 