'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArtworkCard } from "@/components/artwork/artwork-card";
import { publishArtwork, unpublishArtwork } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useArtist } from "@/hooks/use-artist";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  const { isVerifiedArtist, isEmergingArtist, getVerificationStatus, getVerificationPercentage } = useArtist();

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (e.target as HTMLElement).click();
    }
  }, []);

  async function handlePublish(id: string) {
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
      
      setArtworks(artworks.map(artwork => 
        artwork.id === id 
          ? { ...artwork, status: 'published' }
          : artwork
      ));
      toast.success('Artwork published successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to publish artwork:', error);
      toast.error('Failed to publish artwork. Please try again later.');
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
        return;
      }

      setArtworks(artworks.map(artwork => 
        artwork.id === id 
          ? { ...artwork, status: 'draft' }
          : artwork
      ));
      toast.success('Artwork unpublished successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to unpublish artwork:', error);
      toast.error('Failed to unpublish artwork. Please try again later.');
    } finally {
      setIsLoading(null);
    }
  }

  const publishedCount = artworks.filter(a => a.status === 'published').length;
  const isAtPublishLimit = isEmergingArtist && publishedCount >= 10;
  const verificationPercentage = getVerificationPercentage();

  return (
    <div className="max-w-4xl mx-auto p-4" role="main" aria-label="Artwork Management">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Your Artworks</h1>
            {isVerifiedArtist ? (
              <Badge variant="outline" className="gap-1" role="status" aria-label="Verified Artist Status">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Verified Artist
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1" role="status" aria-label="Emerging Artist Status">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                Emerging Artist
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Manage your artwork collection
            {isEmergingArtist && (
              <span className="block text-sm">
                {publishedCount}/10 published artworks used
              </span>
            )}
          </p>
        </div>
        <Button 
          asChild
          disabled={isAtPublishLimit}
          title={isAtPublishLimit ? "Emerging artists can only publish 10 artworks" : undefined}
        >
          <Link 
            href="/artist/artworks/new"
            role="button"
            aria-label={isAtPublishLimit ? "Upload limit reached for emerging artists" : "Add New Artwork"}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            Add New Artwork
          </Link>
        </Button>
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

      {artworks?.length === 0 ? (
        <div className="text-center py-12" role="status" aria-label="No artworks found">
          <p className="text-muted-foreground">
            You haven't added any artworks yet.
          </p>
          <Button 
            asChild 
            className="mt-4"
            disabled={isAtPublishLimit}
            title={isAtPublishLimit ? "Emerging artists can only publish 10 artworks" : undefined}
          >
            <Link 
              href="/artist/artworks/new"
              role="button"
              aria-label="Add Your First Artwork"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              Add Your First Artwork
            </Link>
          </Button>
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Artwork Gallery"
        >
          {artworks?.map((artwork) => (
            <div key={artwork.id} role="listitem">
              <ArtworkCard
                artwork={artwork}
                showStatus
                showEdit
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                isLoading={isLoading === artwork.id}
                isEmergingArtist={isEmergingArtist}
                isAtPublishLimit={isAtPublishLimit}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 