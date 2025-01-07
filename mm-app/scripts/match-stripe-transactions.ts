import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { parse } from 'csv-parse'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Initialize Stripe with production key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Load unified payments data from CSV
async function loadUnifiedPayments() {
  const unifiedPaymentsData = await new Promise<any[]>((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(path.resolve(__dirname, 'unified_payments.csv'))
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });

  return unifiedPaymentsData;
}

async function findArtworkByName(name: string) {
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('id, title, artist_id')
    .ilike('title', name.replace(/\s*\(1\)\s*$/, '')) // Remove (1) suffix
    .limit(1);

  if (error) {
    throw new Error(`Error finding artwork: ${error.message}`);
  }

  return artworks?.[0];
}

async function matchTransactions() {
  console.log('Starting transaction matching process...')
  let matchedCount = 0
  let errorCount = 0

  try {
    // Load unified payments data
    const unifiedPayments = await loadUnifiedPayments();
    console.log(`Loaded ${unifiedPayments.length} unified payments`)
    
    // Log the first payment to see its structure
    console.log('First payment data:', unifiedPayments[0])
    console.log('Available columns:', Object.keys(unifiedPayments[0]))

    // Create payment intent to payment mapping
    const paymentIntentToPayment = new Map<string, any>();
    for (const payment of unifiedPayments) {
      if (payment['PaymentIntent ID']) {
        paymentIntentToPayment.set(payment['PaymentIntent ID'], payment);
      }
    }
    console.log(`Found ${paymentIntentToPayment.size} payment intent mappings`)

    // Get all unmatched transactions
    const { data: transactions, error: fetchError } = await supabase
      .from('transactions')
      .select('id, stripe_payment_intent_id')
      .is('artwork_id', null)
      .eq('status', 'succeeded')
      .not('stripe_payment_intent_id', 'is', null)

    if (fetchError) {
      throw new Error(`Error fetching transactions: ${fetchError.message}`)
    }

    console.log(`Found ${transactions.length} unmatched transactions`)

    // Process each transaction
    for (const transaction of transactions) {
      try {
        console.log(`\nProcessing transaction ${transaction.id}:`)
        console.log(`- Payment Intent: ${transaction.stripe_payment_intent_id}`)

        // Find matching payment by payment intent
        const matchedPayment = paymentIntentToPayment.get(transaction.stripe_payment_intent_id);
        if (!matchedPayment) {
          console.log('- No matching payment found for payment intent')
          continue
        }

        console.log('- Found matching payment:', {
          id: matchedPayment.id,
          line_item: matchedPayment['Checkout Line Item Summary']
        })

        // Check if this is a gallery entry payment
        if (matchedPayment['Checkout Line Item Summary']?.toLowerCase().includes('meaning machine entry')) {
          console.log('- This is a gallery entry payment')
          
          // Update transaction to mark it as a gallery entry
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              is_gallery_entry: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', transaction.id)

          if (updateError) {
            throw new Error(`Error updating transaction: ${updateError.message}`)
          }

          matchedCount++
          console.log(`Updated transaction ${transaction.id} as gallery entry`)
          continue
        }

        // For artwork purchases
        const artwork = await findArtworkByName(matchedPayment['Checkout Line Item Summary']);
        if (!artwork) {
          console.log('- No matching artwork found for:', matchedPayment['Checkout Line Item Summary'])
          continue
        }

        console.log('- Found matching artwork:', artwork)

        // Update transaction with artwork info
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            artwork_id: artwork.id,
            artist_id: artwork.artist_id,
            is_gallery_entry: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id)

        if (updateError) {
          throw new Error(`Error updating transaction: ${updateError.message}`)
        }

        matchedCount++
        console.log(`Updated transaction ${transaction.id} with artwork ${artwork.id} and artist ${artwork.artist_id}`)

      } catch (error) {
        console.error(`Error processing transaction ${transaction.id}:`, error)
        errorCount++
      }
    }

    console.log('\nMatching process completed:')
    console.log(`- Matched: ${matchedCount}`)
    console.log(`- Errors: ${errorCount}`)

  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
matchTransactions().catch(console.error) 
