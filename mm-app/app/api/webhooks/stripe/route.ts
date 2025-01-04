import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/stripe-server-utils'
import { createGhostProfile, getGhostProfileByEmail } from '@/lib/actions/ghost-profiles'
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

        // Transaction will be created/updated by the database trigger
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
  );
} 