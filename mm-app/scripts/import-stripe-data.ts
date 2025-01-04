import 'dotenv/config'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/types/database.types'

if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
  throw new Error('STRIPE_SECRET_KEY must be a live key')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createGhostProfile(email: string, paymentIntent: Stripe.PaymentIntent) {
  // Check if ghost profile already exists
  const { data: existingProfile } = await supabase
    .from('ghost_profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingProfile) {
    console.log(`Ghost profile already exists for email ${email}`)
    return existingProfile.id
  }

  // Create new ghost profile
  const { data: newProfile, error } = await supabase
    .from('ghost_profiles')
    .insert({
      email,
      stripe_customer_id: paymentIntent.customer as string || email,
      is_claimed: false,
      display_name: 'Art Collector',
      is_visible: false,
      total_purchases: 0,
      total_spent: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating ghost profile:', error)
    throw error
  }

  console.log(`Created new ghost profile for ${email} (guest checkout)`)
  return newProfile.id
}

async function recordTransaction(paymentIntent: Stripe.PaymentIntent, ghostProfileId: string) {
  const charge = paymentIntent.latest_charge as Stripe.Charge
  const paymentMethod = charge?.payment_method_details
  const card = paymentMethod?.card
  const billingDetails = charge?.billing_details

  // Map Stripe status to our status enum
  const status = paymentIntent.status === 'requires_capture' ? 'processing' : paymentIntent.status

  // Convert amounts from cents to dollars
  const amountTotal = paymentIntent.amount / 100
  const amountReceived = paymentIntent.amount_received ? paymentIntent.amount_received / 100 : null

  const { error } = await supabase
    .from('transactions')
    .insert({
      stripe_payment_intent_id: paymentIntent.id,
      ghost_profile_id: ghostProfileId,
      amount_total: amountTotal,
      amount_received: amountReceived,
      status,
      payment_intent_status: paymentIntent.status,
      payment_method_id: paymentIntent.payment_method as string,
      payment_method_type: paymentMethod?.type,
      capture_method: paymentIntent.capture_method,
      confirmation_method: paymentIntent.confirmation_method,
      card_brand: card?.brand,
      card_last4: card?.last4,
      card_exp_month: card?.exp_month,
      card_exp_year: card?.exp_year,
      billing_name: billingDetails?.name || null,
      billing_email: billingDetails?.email || null,
      billing_phone: billingDetails?.phone || null,
      billing_address_line1: billingDetails?.address?.line1 || null,
      billing_address_line2: billingDetails?.address?.line2 || null,
      billing_address_city: billingDetails?.address?.city || null,
      billing_address_state: billingDetails?.address?.state || null,
      billing_address_postal_code: billingDetails?.address?.postal_code || null,
      billing_address_country: billingDetails?.address?.country || null,
      // Set platform fee and artist amount to 0 for historical data
      platform_fee: 0,
      artist_amount: 0,
    })

  if (error) {
    console.error('Error recording transaction:', error)
    throw error
  }
}

async function importStripeData() {
  console.log('Starting Stripe data import...')
  let imported = 0
  let skipped = 0
  let errors = 0

  try {
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      expand: ['data.latest_charge', 'data.latest_charge.payment_method_details', 'data.payment_method'],
    })

    console.log(`Found ${paymentIntents.data.length} payment intents`)

    for (const paymentIntent of paymentIntents.data) {
      try {
        console.log(`Processing payment ${paymentIntent.id}`)

        // Skip non-successful payments
        if (paymentIntent.status !== 'succeeded') {
          console.log(`Skipping payment ${paymentIntent.id} with status ${paymentIntent.status}`)
          skipped++
          continue
        }

        const charge = paymentIntent.latest_charge as Stripe.Charge
        const email = charge?.billing_details?.email || paymentIntent.receipt_email

        if (!email) {
          console.log(`Skipping payment ${paymentIntent.id} - no email found`)
          skipped++
          continue
        }

        console.log(`Processing payment ${paymentIntent.id} for email ${email} (guest)`)
        
        // Create or get ghost profile
        const ghostProfileId = await createGhostProfile(email, paymentIntent)

        // Record transaction
        await recordTransaction(paymentIntent, ghostProfileId)
        imported++

      } catch (error) {
        console.error(`Error processing payment ${paymentIntent.id}:`, error)
        errors++
      }
    }

  } catch (error) {
    console.error('Error fetching payment intents:', error)
    throw error
  }

  console.log('\nStripe data import complete!')
  console.log(`Imported: ${imported}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Errors: ${errors}`)
}

importStripeData().catch(console.error) 