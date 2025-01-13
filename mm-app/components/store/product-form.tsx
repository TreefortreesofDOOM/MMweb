'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WallTypeSelect } from '@/components/gallery/wall-type-select';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import type { GalleryWallType } from '@/lib/types/gallery-types';

const productFormSchema = z.object({
  wallType: z.string(),
  isVariablePrice: z.boolean().default(false),
  minPrice: z.number().optional(),
  recommendedPrice: z.number().optional(),
  galleryPrice: z.number().optional(),
}).refine((data) => {
  if (data.wallType === 'trust_wall') {
    return data.isVariablePrice && data.minPrice !== undefined;
  } else {
    return !data.isVariablePrice && data.galleryPrice !== undefined;
  }
}, {
  message: "Trust Wall requires minimum price, other walls require fixed price"
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  artworkId: string;
  currentWallType?: GalleryWallType;
  currentPrice?: number;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export function ProductForm({
  artworkId,
  currentWallType,
  currentPrice,
  onSubmit
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      wallType: currentWallType || 'collectors_wall',
      isVariablePrice: currentWallType === 'trust_wall',
      galleryPrice: currentWallType !== 'trust_wall' ? currentPrice : undefined,
      minPrice: currentWallType === 'trust_wall' ? currentPrice : undefined,
    }
  });

  const wallType = form.watch('wallType') as GalleryWallType;
  const isTrustWall = wallType === 'trust_wall';

  const handleSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="wallType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wall Type</FormLabel>
              <FormControl>
                <WallTypeSelect
                  artworkId={artworkId}
                  currentType={field.value as GalleryWallType}
                  currentPrice={currentPrice}
                  onSelect={(type) => {
                    field.onChange(type);
                    // Reset price fields when wall type changes
                    if (type === 'trust_wall') {
                      form.setValue('isVariablePrice', true);
                      form.setValue('galleryPrice', undefined);
                    } else {
                      form.setValue('isVariablePrice', false);
                      form.setValue('minPrice', undefined);
                      form.setValue('recommendedPrice', undefined);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isTrustWall ? (
          <>
            <FormField
              control={form.control}
              name="minPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter minimum price"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recommendedPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommended Price (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter recommended price"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <FormField
            control={form.control}
            name="galleryPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fixed Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter fixed price"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
} 