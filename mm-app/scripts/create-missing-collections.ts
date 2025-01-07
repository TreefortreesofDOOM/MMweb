import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local', override: true })

import { createServiceRoleClient } from '@/lib/supabase/service-role'

async function createMissingCollections() {
  const supabase = createServiceRoleClient()
  
  // Find claimed ghost profiles with transactions but no collections
  const { data: ghostProfiles } = await supabase
    .from('ghost_profiles')
    .select(`
      id,
      claimed_profile_id,
      transactions!inner(*)
    `)
    .eq('is_claimed', true)
    .not('claimed_profile_id', 'is', null)

  console.log(`Found ${ghostProfiles?.length || 0} claimed ghost profiles`)

  for (const profile of ghostProfiles || []) {
    if (!profile.claimed_profile_id) {
      console.log(`No claimed profile ID for ghost profile ${profile.id}`)
      continue
    }

    // Check if user already has a purchased collection
    const { data: existingCollection } = await supabase
      .from('collections')
      .select('id')
      .eq('patron_id', profile.claimed_profile_id)
      .eq('is_purchased', true)
      .single()

    if (existingCollection) {
      console.log(`Collection already exists for profile ${profile.claimed_profile_id}`)
      continue
    }

    // Create purchased works collection
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .insert({
        name: 'Purchased Works',
        description: 'Your collection of purchased artworks',
        patron_id: profile.claimed_profile_id,
        is_purchased: true,
        is_private: false
      })
      .select()
      .single()

    if (collectionError) {
      console.error(`Error creating collection for ${profile.claimed_profile_id}:`, collectionError)
      continue
    }

    // Add purchased artworks to collection
    const { error: itemsError } = await supabase
      .from('collection_items')
      .insert(
        profile.transactions
          .filter((tx): tx is typeof tx & { artwork_id: string; created_at: string } => 
            tx.status === 'succeeded' && !!tx.artwork_id && !!tx.created_at
          )
          .map(tx => ({
            collection_id: collection.id,
            artwork_id: tx.artwork_id,
            notes: `Purchased on ${new Date(tx.created_at).toLocaleDateString()}`,
            added_at: tx.created_at
          }))
      )

    if (itemsError) {
      console.error(`Error adding items for ${profile.claimed_profile_id}:`, itemsError)
      continue
    }

    console.log(`Created collection for profile ${profile.claimed_profile_id}`)
  }
}

createMissingCollections().catch(console.error) 