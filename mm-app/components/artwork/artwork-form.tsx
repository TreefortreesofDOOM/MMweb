'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormMessage } from '@/components/form-message';
import { ArtworkUpload, type ArtworkImage } from './artwork-upload';
import { createArtwork } from '@/app/actions';

interface ArtworkFormProps {
  userId: string;
}

export function ArtworkForm({ userId }: ArtworkFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ArtworkImage[]>([]);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    if (!images.some(img => img.isPrimary)) {
      setError('Please select a primary image');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      formData.append('images', JSON.stringify(images));

      const result = await createArtwork(formData);
      
      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/artist/dashboard');
    } catch (err: any) {
      if (err?.digest?.includes('NEXT_REDIRECT')) {
        router.push('/artist/dashboard');
        return;
      }

      console.error('Error creating artwork:', err);
      setError(err.message || 'Failed to create artwork');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add New Artwork</h1>
        <Button variant="outline" asChild>
          <Link href="/artist/dashboard">Cancel</Link>
        </Button>
      </div>

      {error && <FormMessage message={{ error }} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Enter artwork title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your artwork"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>

          <ArtworkUpload
            userId={userId}
            onImagesChange={setImages}
            onError={setError}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading || images.length === 0}>
            Save as Draft
          </Button>
          <Button 
            type="submit" 
            name="publish" 
            value="true" 
            variant="default"
            disabled={isLoading || images.length === 0}
          >
            Publish
          </Button>
        </div>
      </form>
    </div>
  );
} 