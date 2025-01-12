import { createClient } from '@/lib/supabase/supabase-server'
import { stripe } from '@/lib/stripe/stripe-server-utils'
import { NextResponse } from 'next/server'
import { calculateFees } from '@/lib/stripe/stripe-server-utils'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  try {
    const { productId, amount, customerEmail } = await req.json()
    const supabase = await createClient()

    // Get store product with artwork and settings
    const { data: product, error: productError } = await supabase
      .from('store_products')
      .select(`
        *,
        artwork:artworks (
          title,
          description,
          images
        ),
        store_settings!inner (
          stripe_account_id,
          application_fee_percent
        )
      `)
      .eq('id', productId)
      .single()

    if (productError || !product) {
      console.error('Error fetching product:', productError)
      return new NextResponse('Product not found', { status: 404 })
    }

    // For variable price products, validate minimum price
    if (product.is_variable_price) {
      if (!amount || amount < product.min_price) {
        return new NextResponse('Amount below minimum price', { status: 400 })
      }
    }

    // Calculate price and fees
    const priceAmount = product.is_variable_price ? amount : product.artwork.price
    const { platformFee } = calculateFees(priceAmount * 100) // Convert to cents

    // Create checkout session with enhanced features
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/cancel`,
      customer_email: customerEmail, // Pre-fill customer email if available
      expires_at: Math.floor(Date.now() / 1000) + 30*60, // 30 minute expiration
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: priceAmount * 100,
          product_data: {
            name: product.artwork.title,
            description: product.artwork.description,
            images: product.artwork.images,
          }
        },
        quantity: 1,
      }],
      payment_intent_data: product.is_variable_price ? undefined : {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: product.store_settings.stripe_account_id,
        },
      },
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      payment_method_types: ['card'],
      automatic_tax: {
        enabled: true
      },
      locale: 'auto',
      metadata: {
        product_id: product.id,
        artwork_id: product.artwork_id,
        artist_id: product.profile_id,
        is_variable_price: product.is_variable_price,
        amount: priceAmount,
      },
    } as Stripe.Checkout.SessionCreateParams)

    return new NextResponse(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new NextResponse('Error creating checkout session', { status: 500 })
  }
} 