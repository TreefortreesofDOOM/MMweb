import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local', override: true })

import { stripe } from '@/lib/stripe/stripe-server-utils'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Quick validation of required env vars
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL and service role key are required')
}

// Ensure we're using test mode for Stripe
if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  throw new Error('Must use Stripe test mode key for seeding test data')
}

// Create Supabase client with service role key for admin operations
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Environment:', process.env.NODE_ENV || 'development')

const TEST_PROFILES = [
  {
    email: 'test.patron1@example.com',
    name: 'Test Patron 1',
    purchases: [
      { amount: 1000, date: '2024-01-15', description: 'Abstract Composition #1' },
      { amount: 2000, date: '2024-02-01', description: 'Digital Landscape' }
    ]
  },
  {
    email: 'test.patron2@example.com',
    name: 'Test Patron 2',
    purchases: [
      { amount: 1500, date: '2024-03-01', description: 'Portrait Study' }
    ]
  }
]

async function createTestCustomer(profile: typeof TEST_PROFILES[0]) {
  const params: Stripe.CustomerCreateParams = {
    email: profile.email,
    name: profile.name,
    metadata: {
      is_test: 'true',
      environment: process.env.NODE_ENV || 'development'
    }
  }
  
  const customer = await stripe.customers.create(params)
  return customer
}

async function createTestPaymentIntent(
  amount: number,
  customerId: string,
  metadata: Record<string, any>
) {
  // Create a payment method first
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 2025,
      cvc: '123',
    },
  })

  const params: Stripe.PaymentIntentCreateParams = {
    amount,
    currency: 'usd',
    customer: customerId,
    payment_method: paymentMethod.id,
    metadata: {
      ...metadata,
      is_test: 'true',
      environment: process.env.NODE_ENV || 'development'
    },
    off_session: true,
    confirm: true
  }
  
  const paymentIntent = await stripe.paymentIntents.create(params)
  return paymentIntent
}

async function createGhostProfile(
  email: string,
  stripeCustomerId: string,
  metadata: Record<string, any>
) {
  const { data, error } = await supabase
    .from('ghost_profiles')
    .insert({
      email,
      stripe_customer_id: stripeCustomerId,
      metadata
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function seedGhostProfiles() {
  console.log('Starting ghost profile seeding...')

  for (const profile of TEST_PROFILES) {
    console.log(`Creating ghost profile for ${profile.email}...`)
    
    // Create Stripe customer
    const customer = await createTestCustomer(profile)
    console.log('Created Stripe customer:', customer.id)

    // Create ghost profile
    const ghostProfile = await createGhostProfile(
      profile.email,
      customer.id,
      {
        is_test: true,
        stripe_created: customer.created,
        environment: process.env.NODE_ENV || 'development'
      }
    )
    console.log('Created ghost profile:', ghostProfile.id)

    // Create payment intents for each purchase
    for (const purchase of profile.purchases) {
      console.log(`Creating payment for ${purchase.description}...`)
      const paymentIntent = await createTestPaymentIntent(
        purchase.amount * 100, // Convert to cents
        customer.id,
        {
          description: purchase.description,
          ghost_profile_id: ghostProfile.id,
          purchase_date: purchase.date
        }
      )
      console.log('Created payment intent:', paymentIntent.id)
    }
  }

  console.log('Ghost profile seeding complete!')
}

async function cleanup() {
  console.log('Starting cleanup...')

  // Delete test ghost profiles
  const { error: profileError } = await supabase
    .from('ghost_profiles')
    .delete()
    .eq('metadata->is_test', true)
    .eq('metadata->environment', process.env.NODE_ENV || 'development')

  if (profileError) {
    console.error('Error deleting ghost profiles:', profileError)
  }

  // Delete test customers in Stripe
  const listParams: Stripe.CustomerListParams = {
    limit: 100,
    expand: ['data.subscriptions']
  }

  const customers = await stripe.customers.list(listParams)
  const testCustomers = customers.data.filter(
    customer => 
      customer.metadata?.is_test === 'true' && 
      customer.metadata?.environment === (process.env.NODE_ENV || 'development')
  )

  for (const customer of testCustomers) {
    await stripe.customers.del(customer.id)
    console.log('Deleted Stripe customer:', customer.id)
  }

  console.log('Cleanup complete!')
}

// Run the script
if (require.main === module) {
  const command = process.argv[2]
  
  if (command === 'cleanup') {
    cleanup()
      .catch(console.error)
      .finally(() => process.exit())
  } else {
    seedGhostProfiles()
      .catch(console.error)
      .finally(() => process.exit())
  }
} 