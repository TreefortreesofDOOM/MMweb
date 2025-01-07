import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/stripe-server-utils'
import { createGhostProfile, getGhostProfileByEmail } from '@/lib/actions/ghost-profiles'
import { createClient } from '@/lib/supabase/supabase-server'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature') ?? ''

  if (!signature) {
    return new NextResponse('No signature', { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Retrieve full payment intent with line items
        const fullPaymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntent.id,
          {
            expand: ['payment_method', 'line_items']
          }
        ) as Stripe.PaymentIntent & {
          line_items?: {
            data: Array<{
              price?: {
                product?: Stripe.Product | string;
              };
            }>;
          };
        }

        const customerResponse = await stripe.customers.retrieve(
          paymentIntent.customer as string
        )

        if (!customerResponse || 'deleted' in customerResponse) {
          console.error('Customer not found or deleted:', paymentIntent.customer)
          return new NextResponse('Customer not found', { status: 400 })
        }

        const customer = customerResponse as Stripe.Customer

        if (!customer.email) {
          console.error('No email found for customer:', customer.id)
          return new NextResponse('No customer email', { status: 400 })
        }

        // Check if ghost profile exists
        let ghostProfile = await getGhostProfileByEmail(customer.email)

        // Create ghost profile if it doesn't exist
        if (!ghostProfile) {
          ghostProfile = await createGhostProfile(
            customer.email,
            customer.id,
            {
              stripe_created: customer.created,
              environment: process.env.NODE_ENV
            }
          )
        }

        // Get artwork ID from line items
        let artworkId: string | null = null
        if (fullPaymentIntent.line_items?.data) {
          for (const lineItem of fullPaymentIntent.line_items.data) {
            if (lineItem.price?.product && typeof lineItem.price.product !== 'string') {
              artworkId = lineItem.price.product.metadata.artwork_id
              if (artworkId) break
            }
          }
        }

        // Create transaction with artwork ID
        const supabase = await createClient()
        const { error: transactionError } = await supabase
          .from('transactions')
          .upsert({
            stripe_payment_intent_id: paymentIntent.id,
            ghost_profile_id: ghostProfile.id,
            artwork_id: artworkId,
            amount_total: paymentIntent.amount,
            status: 'succeeded',
            stripe_created: new Date(paymentIntent.created * 1000).toISOString(),
            stripe_succeeded_at: new Date().toISOString(),
            payment_method: paymentIntent.payment_method,
            metadata: {
              ...paymentIntent.metadata,
              stripe_customer_id: customer.id,
              environment: process.env.NODE_ENV
            }
          })

        if (transactionError) {
          console.error('Error creating transaction:', transactionError)
          return new NextResponse('Transaction creation failed', { status: 500 })
        }

        return new NextResponse(null, { status: 200 })
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        // Handle failed payment - maybe notify admin or artist
        return new NextResponse(null, { status: 200 })
      }

      default: {
        console.log('Unhandled event type:', event.type)
        return new NextResponse(null, { status: 200 })
      }
    }
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new NextResponse('Webhook error', { status: 400 })
  }
}

export async function GET(req: Request) {
  return new NextResponse(
    JSON.stringify({ message: 'Stripe webhook endpoint is active' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1'
      }
    }
  )
} 