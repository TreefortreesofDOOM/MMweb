'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from '@/components/store/product-form';
import { updateProductPrice } from '@/lib/actions/store-actions';
import { toast } from 'sonner';
import type { GalleryWallType } from '@/lib/types/gallery-types';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const supabase = createBrowserClient();

  const { data: artwork, isLoading } = useQuery({
    queryKey: ['artwork', params.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          description,
          images,
          gallery_wall_type,
          gallery_price,
          store_products (
            id,
            is_variable_price,
            min_price,
            gallery_price,
            metadata
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (values: {
    wallType: string;
    isVariablePrice: boolean;
    minPrice?: number;
    recommendedPrice?: number;
    galleryPrice?: number;
  }) => {
    try {
      await updateProductPrice({
        artworkId: params.id,
        wallType: values.wallType as GalleryWallType,
        isVariablePrice: values.isVariablePrice,
        minPrice: values.minPrice,
        recommendedPrice: values.recommendedPrice,
        galleryPrice: values.galleryPrice
      });

      toast.success('Product updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!artwork) {
    return <div>Artwork not found</div>;
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            artworkId={artwork.id}
            currentWallType={artwork.gallery_wall_type}
            currentPrice={artwork.gallery_price}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
} 