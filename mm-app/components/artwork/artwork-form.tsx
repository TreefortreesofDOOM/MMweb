'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArtworkUpload, type ArtworkImage } from './artwork-upload';
import { ArtworkAIAnalysis } from './artwork-ai-analysis';
import { createArtwork, updateArtwork } from '@/app/actions';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce
    .number()
    .min(0, 'Price must be 0 or greater')
    .max(1000000, 'Price must be less than 1,000,000'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  primaryImage: z.string(),
  styles: z.array(z.string()).optional(),
  techniques: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface FieldProps {
  field: {
    value: string | number | string[];
    onChange: (...event: any[]) => void;
  };
}

interface ArtworkFormProps {
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

export function ArtworkForm({ artwork }: ArtworkFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      });

      if (artwork?.id) {
        await updateArtwork(artwork.id, formData);
      } else {
        await createArtwork(formData);
      }
      
      router.push('/artist/artworks');
    } catch (error) {
      console.error('Error saving artwork:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagesChange = (images: ArtworkImage[]) => {
    const urls = images.map((img) => img.url);
    const primaryImage = images.find((img) => img.isPrimary)?.url || '';
    form.setValue('images', urls);
    form.setValue('primaryImage', primaryImage);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
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
          <label className="text-sm font-medium">Images</label>
          <ArtworkUpload
            userId="test"
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
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
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
          <label htmlFor="price" className="text-sm font-medium">
            Price (USD)
          </label>
          <Input
            id="price"
            type="number"
            {...form.register('price')}
            className={form.formState.errors.price ? 'border-red-500' : ''}
          />
          {form.formState.errors.price && (
            <p className="text-sm text-red-500">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : artwork ? 'Save Changes' : 'Create Artwork'}
        </Button>
      </form>
    </div>
  );
} 