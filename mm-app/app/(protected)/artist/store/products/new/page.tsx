import { createClient } from '@/lib/supabase/supabase-server'
import { ProductForm } from '@/components/store/product-form'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProductPrice } from '@/lib/actions/store-actions'
import type { GalleryWallType } from '@/lib/types/gallery-types'

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { artwork?: string }
}) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Verify artwork exists and belongs to user
  if (!searchParams.artwork) {
    redirect('/artist/store')
  }

  const { data: artwork } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', searchParams.artwork)
    .eq('artist_id', user.id)
    .single()

  if (!artwork) {
    redirect('/artist/store')
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Artwork to Store</CardTitle>
          <CardDescription>
            Configure how your artwork will be sold in the store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm 
            artworkId={artwork.id}
            onSubmit={async (values) => {
              await updateProductPrice({
                artworkId: artwork.id,
                wallType: values.wallType as GalleryWallType,
                isVariablePrice: values.isVariablePrice,
                minPrice: values.minPrice,
                recommendedPrice: values.recommendedPrice,
                galleryPrice: values.galleryPrice
              });
              redirect('/artist/store');
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
} 