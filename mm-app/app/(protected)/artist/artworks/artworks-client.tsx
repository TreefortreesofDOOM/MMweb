'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SortableArtworkGrid } from "@/components/artwork/sortable-image-grid/sortable-artwork-grid";
import { publishArtwork, unpublishArtwork, updateArtworkOrder } from '@/lib/actions/artwork';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useArtist } from "@/hooks/use-artist";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ArtworksClientProps {
  artworks: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    description?: string;
    images: Array<{
      url: string;
      isPrimary: boolean;
      order: number;
    }>;
    profiles?: {
      id: string;
      avatar_url: string;
      name: string;
    };
  }>;
}

export default function ArtworksClient({ artworks: initialArtworks }: ArtworksClientProps) {
  const [artworks, setArtworks] = useState(initialArtworks);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const { isVerifiedArtist, isEmergingArtist, getVerificationStatus, getVerificationPercentage } = useArtist();

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (e.target as HTMLElement).click();
    }
  }, []);

  async function handlePublish(id: string) {
    if (!id) return;

    if (isEmergingArtist && artworks.filter(a => a.status === 'published').length >= 10) {
      toast.error('Emerging artists can only have 10 published artworks at a time');
      return;
    }

    setIsLoading(id);
    try {
      const result = await publishArtwork(id);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (!result.artwork) {
        toast.error('Failed to publish artwork. Please try again.');
        return;
      }
      
      setArtworks(artworks.map(artwork => 
        artwork.id === id 
          ? { ...artwork, status: 'published' }
          : artwork
      ));
      
      toast.success('Artwork published successfully');
    } catch (error) {
      console.error('Failed to publish artwork:', error);
      toast.error('Failed to publish artwork. Please try again later.');
    } finally {
      setIsLoading(null);
    }
  }

  async function handleUnpublish(id: string) {
    if (!id) return;

    setIsLoading(id);
    try {
      const result = await unpublishArtwork(id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (!result.artwork) {
        toast.error('Failed to unpublish artwork. Please try again.');
        return;
      }

      setArtworks(artworks.map(artwork => 
        artwork.id === id 
          ? { ...artwork, status: 'draft' }
          : artwork
      ));

      toast.success('Artwork unpublished successfully');
    } catch (error) {
      console.error('Failed to unpublish artwork:', error);
      toast.error('Failed to unpublish artwork. Please try again later.');
    } finally {
      setIsLoading(null);
    }
  }

  async function handleReorder(artworkIds: string[]) {
    try {
      // Update local state immediately for optimistic UI
      const newArtworks = [...artworks];
      const reorderedArtworks = artworkIds.map(id => 
        newArtworks.find(a => a.id === id)!
      );
      setArtworks(reorderedArtworks);

      // Then update the server
      const result = await updateArtworkOrder(artworkIds);
      if (result.error) {
        // Revert on error
        setArtworks(artworks);
        toast.error(result.error);
        return;
      }
      toast.success('Artwork order updated successfully');
    } catch (error) {
      // Revert on error
      setArtworks(artworks);
      console.error('Failed to update artwork order:', error);
      toast.error('Failed to update artwork order. Please try again later.');
    }
  }

  const publishedCount = artworks.filter(a => a.status === 'published').length;
  const isAtPublishLimit = isEmergingArtist && publishedCount >= 10;
  const verificationPercentage = getVerificationPercentage();

  return (
    <div className="max-w-4xl mx-auto p-4" role="main" aria-label="Artwork Management">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Artwork Management</h1>
          <p className="text-muted-foreground">
            Manage your artwork collection. Changes here will appear in your public portfolio.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'} total
          </p>
          <div className="mt-2">
            <Link 
              href="/artist/portfolio" 
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <span>View your public portfolio</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <Link href="/artist/artworks/new" passHref>
          <Button>
            Add New Artwork
          </Button>
        </Link>
      </div>

      {isEmergingArtist && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Emerging Artist Status</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>
                As an emerging artist, you can publish up to 10 artworks. 
                <Link 
                  href="/artist/verification" 
                  className="underline ml-1"
                  role="link"
                  aria-label="Start verification process to become a verified artist"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  Get verified to unlock unlimited uploads.
                </Link>
              </p>
              {verificationPercentage > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Verification Progress</span>
                    <span>{verificationPercentage}%</span>
                  </div>
                  <Progress value={verificationPercentage} className="h-2" />
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {artworks.length === 0 ? (
        <div className="text-center py-12" role="status">
          <h2 className="text-lg font-semibold text-primary">No artworks yet</h2>
          <p className="text-muted-foreground mt-2">Start by adding your first artwork</p>
          <div className="mt-4">
            <Link href="/artist/artworks/new" passHref>
              <Button>Add New Artwork</Button>
            </Link>
          </div>
        </div>
      ) : (
        <SortableArtworkGrid
          artworks={artworks}
          onReorder={handleReorder}
          showStatus
          showEdit
          onPublish={(id) => {
            console.log('Publish clicked for artwork:', id);
            handlePublish(id);
          }}
          onUnpublish={(id) => {
            console.log('Unpublish clicked for artwork:', id);
            handleUnpublish(id);
          }}
          isLoading={isLoading}
          isEmergingArtist={isEmergingArtist}
          isAtPublishLimit={isAtPublishLimit}
        />
      )}
    </div>
  );
} 