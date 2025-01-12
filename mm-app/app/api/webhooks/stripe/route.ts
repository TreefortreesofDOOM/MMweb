import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe-server-utils'
import { createClient } from '@/lib/supabase/supabase-server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Missing stripe signature or webhook secret', { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      
      // Get the product ID from the line items
      const productId = lineItems.data[0]?.price?.product as string
      if (!productId) {
        console.error('No product ID found in session:', session.id)
        return new NextResponse('No product ID found', { status: 400 })
      }

      // Get the product to check if it's a limited edition
      const product = await stripe.products.retrieve(productId)
      if (!product.metadata.limited_edition) {
        return new NextResponse('OK')
      }

      // Update inventory for limited editions
      const currentInventory = parseInt(product.metadata.inventory || '0')
      const quantitySold = lineItems.data[0]?.quantity || 1
      const newInventory = Math.max(0, currentInventory - quantitySold)
      
      // Update product metadata with new inventory
      await stripe.products.update(productId, {
        metadata: {
          ...product.metadata,
          inventory: newInventory.toString(),
          inventory_status: newInventory > 0 ? 'in_stock' : 'out_of_stock'
        }
      })

      // Update store_products inventory status via metadata
      const supabase = await createClient()
      await supabase
        .from('store_products')
        .update({
          stripe_product_metadata: {
            ...product.metadata,
            inventory: newInventory.toString(),
            inventory_status: newInventory > 0 ? 'in_stock' : 'out_of_stock'
          }
        })
        .eq('stripe_product_id', productId)
    }

    return new NextResponse('OK')
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new NextResponse('Webhook error', { status: 400 })
  }
}

export async function GET() {
  return new NextResponse('Stripe webhook endpoint active', { status: 200 })
} 