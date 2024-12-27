'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArtworkUpload, type ArtworkImage } from './artwork-upload';
import { ArtworkAIAnalysis } from './artwork-ai-analysis';
import { createArtwork, updateArtwork } from '@/lib/actions';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce
    .number()
    .min(0, 'Price must be 0 or greater')
    .max(1000000, 'Price must be less than 1,000,000')
    .transform(val => Number(val.toFixed(2))),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  primaryImage: z.string(),
  styles: z.array(z.string()).optional(),
  techniques: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ArtworkFormProps {
  userId: string;
  artwork?: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: ArtworkImage[];
    styles?: string[];
    techniques?: string[];
    keywords?: string[];
  };
}

export function ArtworkForm({ artwork, userId }: ArtworkFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImages, setCurrentImages] = useState<ArtworkImage[]>(artwork?.images || []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: artwork?.title || '',
      description: artwork?.description || '',
      price: artwork?.price || 0,
      images: artwork?.images?.map(img => img.url) || [],
      primaryImage: artwork?.images?.find(img => img.isPrimary)?.url || '',
      styles: artwork?.styles || [],
      techniques: artwork?.techniques || [],
      keywords: artwork?.keywords || [],
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      console.log('Form submission data:', data);
      
      const formData = new FormData();
      
      // Use the current images state which maintains the full image structure
      const images = currentImages.map(img => ({
        ...img,
        isPrimary: img.url === data.primaryImage
      }));
      
      // Prepare the form data
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('images', JSON.stringify(images));
      formData.append('styles', JSON.stringify(data.styles || []));
      formData.append('techniques', JSON.stringify(data.techniques || []));
      formData.append('keywords', JSON.stringify(data.keywords || []));

      console.log('Prepared form data:', {
        title: data.title,
        description: data.description,
        price: data.price,
        images,
        styles: data.styles,
        techniques: data.techniques,
        keywords: data.keywords
      });

      if (artwork?.id) {
        const result = await updateArtwork(artwork.id, formData);
        if (result.error) {
          console.error('Error updating artwork:', result.error);
          return;
        }
        console.log('Update successful:', result);
      } else {
        const result = await createArtwork(formData);
        if (result.error) {
          console.error('Error creating artwork:', result.error);
          return;
        }
        console.log('Create successful:', result);
      }
      
      router.push('/artist/artworks');
      router.refresh(); // Force a refresh of the page data
    } catch (error) {
      console.error('Error saving artwork:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagesChange = (images: ArtworkImage[]) => {
    // Update the current images state
    setCurrentImages(images);
    
    // Update form values
    const urls = images.map((img) => img.url);
    const primaryImage = images.find((img) => img.isPrimary)?.url || '';
    
    form.setValue('images', urls, { shouldValidate: true });
    form.setValue('primaryImage', primaryImage, { shouldValidate: true });
    
    console.log('Images updated:', {
      currentImages: images,
      urls,
      primaryImage
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{artwork ? 'Edit Artwork' : 'Create New Artwork'}</CardTitle>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register('title')}
              className={form.formState.errors.title ? 'border-red-500' : ''}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <ArtworkUpload
              userId={userId}
              onImagesChange={handleImagesChange}
              onError={(error) => console.error(error)}
              existingImages={artwork?.images}
            />
            {form.formState.errors.images && (
              <p className="text-sm text-red-500">
                {form.formState.errors.images.message}
              </p>
            )}
          </div>

          {form.watch('primaryImage') && (
            <ArtworkAIAnalysis
              imageUrl={form.watch('primaryImage')}
              onApplyDescription={(description) =>
                form.setValue('description', description)
              }
              onApplyStyles={(styles) => form.setValue('styles', styles)}
              onApplyTechniques={(techniques) =>
                form.setValue('techniques', techniques)
              }
              onApplyKeywords={(keywords) => form.setValue('keywords', keywords)}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              className={form.formState.errors.description ? 'border-red-500' : ''}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              max="1000000"
              {...form.register('price')}
              className={form.formState.errors.price ? 'border-red-500' : ''}
            />
            {form.formState.errors.price && (
              <p className="text-sm text-red-500">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : artwork ? 'Save Changes' : 'Create Artwork'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 