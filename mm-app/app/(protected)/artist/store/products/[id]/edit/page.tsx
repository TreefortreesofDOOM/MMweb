import { createClient } from '@/lib/supabase/supabase-server'
import { ProductForm } from '@/components/store/product-form'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get product with artwork details
  const { data: product } = await supabase
    .from('store_products')
    .select(`
      *,
      artwork:artworks (
        id,
        title,
        description,
        images
      )
    `)
    .eq('id', params.id)
    .eq('profile_id', user.id)
    .single()

  if (!product) {
    redirect('/artist/store')
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Store Product</CardTitle>
          <CardDescription>
            Update your artwork&apos;s store settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm 
            artwork={product.artwork}
            product={product}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  )
} 