'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WallTypeSelect } from '@/components/gallery/wall-type-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import type { GalleryWallType } from '@/lib/types/gallery-types';
import { updateProductPrice } from '@/lib/actions/store-actions';
import { useRouter } from 'next/navigation';

const productFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  wallType: z.string(),
  isVariablePrice: z.boolean().default(false),
  price: z.number().min(10, "Minimum price must be at least $10"),
  recommendedPrice: z.number().optional(),
}).refine((data) => {
  if (data.wallType === 'trust_wall') {
    return data.isVariablePrice && data.price >= 10;
  }
  return true;
}, {
  message: "Trust Wall requires a minimum price of at least $10"
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  artworkId: string;
  artwork: {
    title: string;
    description?: string | null;
    price?: number | null;
  };
  currentWallType?: GalleryWallType;
}

export function ProductForm({
  artworkId,
  artwork,
  currentWallType,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: artwork.title,
      description: artwork.description || '',
      wallType: currentWallType || '',
      isVariablePrice: currentWallType === 'trust_wall',
      price: currentWallType === 'trust_wall' ? 10 : (artwork.price || 0),
      recommendedPrice: currentWallType === 'trust_wall' ? (artwork.price || undefined) : undefined,
    }
  });

  // Watch for wall type changes to update prices
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'wallType') {
        const isTrustWall = value.wallType === 'trust_wall';
        if (isTrustWall) {
          form.setValue('price', 10);
          form.setValue('recommendedPrice', artwork.price || undefined);
        } else {
          form.setValue('price', artwork.price || 0);
          form.setValue('recommendedPrice', undefined);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, artwork.price]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      await updateProductPrice({
        artworkId,
        wallType: values.wallType as GalleryWallType,
        isVariablePrice: values.wallType === 'trust_wall',
        minPrice: values.wallType === 'trust_wall' ? values.price : undefined,
        recommendedPrice: values.wallType === 'trust_wall' ? values.recommendedPrice : undefined,
        galleryPrice: values.wallType !== 'trust_wall' ? values.price : undefined
      });
      router.push('/artist/store');
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTrustWall = form.watch('wallType') === 'trust_wall';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormDescription>
                The title of your artwork as it will appear in the store
              </FormDescription>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormDescription>
                Describe your artwork to potential buyers
              </FormDescription>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={4}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wallType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Location</FormLabel>
              <FormDescription>
                Choose where your artwork will be displayed in the gallery
              </FormDescription>
              <FormControl>
                <WallTypeSelect
                  artworkId={artworkId}
                  currentType={field.value as GalleryWallType}
                  currentPrice={form.getValues('price')}
                  onSelect={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isTrustWall ? 'Minimum Price' : 'Fixed Price'}</FormLabel>
              <FormDescription>
                {isTrustWall 
                  ? 'Set the minimum price buyers must pay. We recommend setting this between $10-$30.'
                  : 'Set the fixed price for your artwork. This will be the exact amount buyers pay.'}
              </FormDescription>
              <FormControl>
                <Input
                  type="number"
                  min={isTrustWall ? 10 : 0}
                  step="0.01"
                  placeholder={isTrustWall ? "Enter minimum price (10.00 - 30.00)" : "Enter price"}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isTrustWall && (
          <FormField
            control={form.control}
            name="recommendedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recommended Price</FormLabel>
                <FormDescription>
                  This is your artwork's original price. Buyers will see this as the recommended amount but can pay any amount above your minimum price.
                </FormDescription>
                <FormControl>
                  <Input
                    type="number"
                    min={form.getValues('price')}
                    step="0.01"
                    placeholder="Enter recommended price"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
} 