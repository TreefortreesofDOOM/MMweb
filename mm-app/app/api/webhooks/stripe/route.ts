import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe-server-utils'
import { createClient } from '@/lib/supabase/supabase-server'
import { calculateFees } from '@/lib/stripe/stripe-server-utils'
import { processGuestPurchase } from '@/lib/actions/ghost-profiles'
import { processUserPurchase } from '@/lib/actions/patron-actions'
import type Stripe from 'stripe'

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
      
      // Process transaction first
      try {
        const email = session.customer_details?.email
        const name = session.customer_details?.name

        if (!email) {
          throw new Error('No email found in session')
        }

        // Calculate amounts (convert from cents to dollars)
        const { platformFee, artistAmount, customerAmount } = calculateFees(session.amount_total || 0)

        // Get artwork ID from metadata
        const artworkId = session.metadata?.artwork_id
        if (!artworkId) {
          throw new Error('No artwork ID found in session metadata')
        }

        if (session.metadata?.user_id) {
          // Logged in user - use processUserPurchase
          await processUserPurchase({
            userId: session.metadata.user_id,
            artworkId,
            stripePaymentIntentId: session.payment_intent as string,
            amount: {
              total: customerAmount / 100,
              artistAmount: artistAmount / 100,
              platformFee: platformFee / 100
            },
            paymentDetails: {
              status: 'succeeded',
              billingEmail: email,
              billingName: name || ''
            }
          })
        } else {
          // Guest purchase - use processGuestPurchase
          await processGuestPurchase({
            email,
            stripeCustomerId: session.customer as string,
            artworkId,
            stripePaymentIntentId: session.payment_intent as string,
            amount: {
              total: customerAmount / 100,
              artistAmount: artistAmount / 100,
              platformFee: platformFee / 100
            },
            paymentDetails: {
              status: 'succeeded',
              billingEmail: email,
              billingName: name || ''
            }
          })
        }
      } catch (error) {
        console.error('Error processing transaction:', error)
        // Continue with inventory update even if transaction processing fails
      }

      // Update inventory for limited editions
      if (product.metadata.limited_edition) {
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