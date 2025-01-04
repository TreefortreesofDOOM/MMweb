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
import { toast, Toaster } from 'sonner';
import { AIMessageBubble } from '@/components/ai/ai-message-bubble';
import { ArtworkTags } from '@/components/artwork/artwork-tags';

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

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors);
    
    // Collect all error messages
    const errorMessages = [];
    
    if (errors.title) {
      errorMessages.push({
        message: "Title is required",
        fieldId: 'title'
      });
    }
    if (errors.description) {
      errorMessages.push({
        message: "Description is required",
        fieldId: 'description'
      });
    }
    if (errors.price) {
      const priceMessage = errors.price.type === 'min' 
        ? "Price must be 0 or greater"
        : errors.price.type === 'max'
          ? "Price must be less than 1,000,000"
          : "Please enter a valid price for your artwork";
      
      errorMessages.push({
        message: priceMessage,
        fieldId: 'price'
      });
    }
    if (errors.images) {
      errorMessages.push({
        message: "Please upload at least one image",
        fieldId: null
      });
    }

    // Show a single toast with all error messages
    if (errorMessages.length > 0) {
      const firstError = errorMessages[0];
      toast.custom((id) => (
        <AIMessageBubble 
          message={firstError.message}
          type="error"
          onDismiss={() => toast.dismiss(id)}
          onClick={() => {
            if (firstError.fieldId) {
              document.getElementById(firstError.fieldId)?.focus();
            }
            toast.dismiss(id);
          }}
        />
      ), {
        duration: 4000,
      });
    }
  };

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

      if (artwork?.id) {
        const result = await updateArtwork(artwork.id, formData);
        if (result.error) {
          console.error('Error updating artwork:', result.error);
          toast.custom((id) => (
            <AIMessageBubble 
              message={result.error}
              type="error"
              onDismiss={() => toast.dismiss(id)}
            />
          ));
          return;
        }
        toast.custom((id) => (
          <AIMessageBubble 
            message="Artwork updated successfully"
            type="success"
            onDismiss={() => toast.dismiss(id)}
          />
        ));
      } else {
        const result = await createArtwork(formData);
        if (result.error) {
          console.error('Error creating artwork:', result.error);
          toast.custom((id) => (
            <AIMessageBubble 
              message={result.error}
              type="error"
              onDismiss={() => toast.dismiss(id)}
            />
          ));
          return;
        }
        toast.custom((id) => (
          <AIMessageBubble 
            message="Artwork created successfully"
            type="success"
            onDismiss={() => toast.dismiss(id)}
          />
        ));
      }

      router.push('/artist/artworks');
      router.refresh(); // Force a refresh of the page data
    } catch (error) {
      console.error('Error saving artwork:', error);
      toast.custom((id) => (
        <AIMessageBubble 
          message="Failed to save artwork"
          type="error"
          onDismiss={() => toast.dismiss(id)}
        />
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagesChange = (images: ArtworkImage[]) => {
    // Batch the updates to prevent multiple re-renders
    const urls = images.map((img) => img.url);
    const primaryImage = images.find((img) => img.isPrimary)?.url || '';
    
    // Update all values at once
    form.setValue('images', urls);
    form.setValue('primaryImage', primaryImage);
    form.trigger(['images', 'primaryImage']);
    
    // Update current images last
    setCurrentImages(images);
    
    console.log('Images updated:', {
      currentImages: images,
      urls,
      primaryImage
    });
  };

  return (
    <>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          className: "!p-0 !bg-transparent !border-0 !shadow-none",
          unstyled: true,
          style: {
            marginBottom: '80px', // Space for the floating agent
            marginRight: '80px', // Offset to the left of the floating agent
          }
        }}
      />
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{artwork ? 'Edit Artwork' : 'Create New Artwork'}</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
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

            {/* Styles, Techniques, and Keywords */}
            <ArtworkTags
              label="Styles"
              tags={form.watch('styles') || []}
              onRemove={(tag) => {
                const currentStyles = form.watch('styles') || [];
                form.setValue('styles', currentStyles.filter(t => t !== tag));
              }}
              onAdd={(tag) => {
                const currentStyles = form.watch('styles') || [];
                if (!currentStyles.includes(tag)) {
                  form.setValue('styles', [...currentStyles, tag]);
                }
              }}
            />

            <ArtworkTags
              label="Techniques"
              tags={form.watch('techniques') || []}
              onRemove={(tag) => {
                const currentTechniques = form.watch('techniques') || [];
                form.setValue('techniques', currentTechniques.filter(t => t !== tag));
              }}
              onAdd={(tag) => {
                const currentTechniques = form.watch('techniques') || [];
                if (!currentTechniques.includes(tag)) {
                  form.setValue('techniques', [...currentTechniques, tag]);
                }
              }}
            />

            <ArtworkTags
              label="Keywords"
              tags={form.watch('keywords') || []}
              onRemove={(tag) => {
                const currentKeywords = form.watch('keywords') || [];
                form.setValue('keywords', currentKeywords.filter(t => t !== tag));
              }}
              onAdd={(tag) => {
                const currentKeywords = form.watch('keywords') || [];
                if (!currentKeywords.includes(tag)) {
                  form.setValue('keywords', [...currentKeywords, tag]);
                }
              }}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Saving...' : artwork ? 'Save Changes' : 'Create Artwork'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
} 