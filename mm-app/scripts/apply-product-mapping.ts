import { stripe } from '@/lib/stripe/stripe-server-utils'
import { createClient } from '@/lib/supabase/supabase-server'
import { parse } from 'yaml'
import { readFileSync } from 'fs'
import type Stripe from 'stripe'

interface ProductMapping {
  [productId: string]: {
    artwork_id: string;
  };
}

async function applyMapping() {
  console.log('Starting to apply product-artwork mapping...')
  const supabase = await createClient()
  let matchedCount = 0
  let errorCount = 0

  try {
    // Read and parse the mapping file
    const mappingFile = readFileSync('./product-artwork-mapping.yml', 'utf8')
    const mapping: ProductMapping = parse(mappingFile)

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
        // Fetch payment intent with expanded line items
        const paymentIntent = await stripe.paymentIntents.retrieve(
          transaction.stripe_payment_intent_id,
          {
            expand: ['line_items']
          }
        ) as Stripe.PaymentIntent & {
          line_items?: {
            data: Array<{
              price?: {
                product: string;
              };
            }>;
          };
        }

        // Find the product ID and corresponding artwork ID
        let artworkId: string | null = null
        if (paymentIntent.line_items?.data) {
          for (const lineItem of paymentIntent.line_items.data) {
            if (lineItem.price?.product) {
              const productId = lineItem.price.product
              const mappedArtwork = mapping[productId]?.artwork_id
              if (mappedArtwork) {
                artworkId = mappedArtwork
                break
              }
            }
          }
        }

        if (artworkId) {
          // Verify artwork exists
          const { data: artwork, error: artworkError } = await supabase
            .from('artworks')
            .select('id')
            .eq('id', artworkId)
            .single()

          if (artworkError || !artwork) {
            console.warn(`Artwork ${artworkId} not found for transaction ${transaction.id}`)
            errorCount++
            continue
          }

          // Update transaction with artwork ID
          const { error: updateError } = await supabase
            .from('transactions')
            .update({
              artwork_id: artworkId,
              updated_at: new Date().toISOString()
            })
            .eq('id', transaction.id)

          if (updateError) {
            throw new Error(`Error updating transaction: ${updateError.message}`)
          }

          matchedCount++
          console.log(`Updated transaction ${transaction.id} with artwork ${artworkId}`)
        } else {
          console.warn(`No mapping found for transaction ${transaction.id}`)
          errorCount++
        }
      } catch (error) {
        console.error(`Error processing transaction ${transaction.id}:`, error)
        errorCount++
      }
    }
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }

  console.log('\nMapping application completed:')
  console.log(`- Matched: ${matchedCount}`)
  console.log(`- Errors: ${errorCount}`)
}

// Run the script
applyMapping().catch(console.error) 