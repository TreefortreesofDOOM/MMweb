import { createClient } from '@/lib/supabase/supabase-server'
import { ProductForm } from '@/components/store/product-form'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
  searchParams: Promise<{ artwork?: string }> | { artwork?: string }
}

export default async function NewProductPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Verify artwork exists and belongs to user
  if (!params.artwork) {
    redirect('/artist/store')
  }

  const { data: artwork } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', params.artwork)
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
            artwork={{
              title: artwork.title,
              description: artwork.description,
              price: artwork.price
            }}
            currentWallType={artwork.gallery_wall_type}
            currentPrice={artwork.gallery_price}
          />
        </CardContent>
      </Card>
    </div>
  )
} 