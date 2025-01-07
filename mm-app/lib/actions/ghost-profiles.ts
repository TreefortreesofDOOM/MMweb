import { createActionClient } from '@/lib/supabase/supabase-action-utils'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { stripe } from '@/lib/stripe/stripe-server-utils'
import type { GhostProfile, StripeTransaction, PaymentStatus, DbGhostProfile } from '@/lib/types/ghost-profiles'
import { toGhostProfile, toTransaction } from '@/lib/types/ghost-profiles'
import type { Database } from '@/lib/types/database.types'

interface GuestPurchaseData {
  email: string
  stripeCustomerId: string
  artworkId: string
  stripePaymentIntentId: string
  amount: {
    total: number
    artistAmount: number
    platformFee: number
  }
  paymentDetails: {
    status: Database['public']['Enums']['payment_status']
    billingEmail: string
    billingName: string
  }
}

export async function createGhostProfile(
  email: string,
  stripeCustomerId: string,
  metadata: Record<string, any> = {}
) {
  const supabase = await createActionClient()
  
  const { data: profile, error } = await supabase
    .from('ghost_profiles')
    .insert({
      email,
      stripe_customer_id: stripeCustomerId,
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
        source: metadata.source || 'direct'
      }
    })
    .select()
    .single()

  if (error) throw error
  return toGhostProfile(profile)
}

export async function getGhostProfile(id: string) {
  const supabase = await createActionClient()
  
  const { data: profile, error } = await supabase
    .from('ghost_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return toGhostProfile(profile)
}

export async function getGhostProfileByEmail(email: string) {
  const supabase = createServiceRoleClient()
  
  const { data: profile, error } = await supabase
    .from('ghost_profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
  return profile ? toGhostProfile(profile) : null
}

export async function updateGhostProfile(
  id: string,
  updates: Partial<GhostProfile>
) {
  const supabase = await createActionClient()
  
  const { data: profile, error } = await supabase
    .from('ghost_profiles')
    .update({
      display_name: updates.displayName,
      is_visible: updates.isVisible,
      metadata: updates.metadata,
      is_claimed: updates.isClaimed,
      claimed_profile_id: updates.claimedProfileId
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return toGhostProfile(profile)
}

export async function getGhostProfileTransactions(
  ghostProfileId: string,
  options: {
    limit?: number
    offset?: number
    status?: PaymentStatus
  } = {}
) {
  const supabase = await createActionClient()
  
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('ghost_profile_id', ghostProfileId)
    .order('created_at', { ascending: false })

  if (options.status) {
    query = query.eq('status', options.status)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    )
  }

  const { data: transactions, error } = await query

  if (error) throw error
  return transactions.map(toTransaction)
}

export async function claimGhostProfile(
  ghostProfileId: string,
  profileId: string
) {
  const supabase = createServiceRoleClient()
  
  // Get the ghost profile first
  const { data: dbGhostProfile, error: fetchError } = await supabase
    .from('ghost_profiles')
    .select('*')
    .eq('id', ghostProfileId)
    .single()

  if (fetchError) throw fetchError
  if (!dbGhostProfile) throw new Error('Ghost profile not found')

  const ghostProfile = toGhostProfile(dbGhostProfile)

  // Start a transaction to update both tables
  const { data: profile, error: profileError } = await supabase
    .from('ghost_profiles')
    .update({
      is_claimed: true,
      claimed_profile_id: profileId,
      metadata: {
        claimed_at: new Date().toISOString(),
        ...(typeof dbGhostProfile.metadata === 'object' ? dbGhostProfile.metadata : {})
      }
    })
    .eq('id', ghostProfileId)
    .select()
    .single()

  if (profileError) throw profileError

  // Update the user's profile with the ghost profile data
  const { error: userProfileError } = await supabase
    .from('profiles')
    .update({
      total_purchases: ghostProfile.totalPurchases,
      total_spent: ghostProfile.totalSpent,
      ghost_profile_claimed: true,
      last_purchase_date: ghostProfile.lastPurchaseDate,
    })
    .eq('id', profileId)

  if (userProfileError) throw userProfileError

  // Update transactions with hybrid approach
  const { error: transactionError } = await supabase
    .from('transactions')
    .update({
      buyer_id: profileId,
      metadata: {
        claimed_at: new Date().toISOString(),
        original_ghost_profile_id: ghostProfileId
      }
    })
    .eq('ghost_profile_id', ghostProfileId)
    .is('buyer_id', null)

  if (transactionError) throw transactionError

  // Create purchased works collection after claiming
  await createPurchasedWorksCollection(profileId, ghostProfileId)

  return toGhostProfile(profile)
}

export async function getGhostProfilesByArtist(artistId: string) {
  const supabase = await createActionClient()
  
  const { data: profiles, error } = await supabase
    .from('ghost_profiles')
    .select('*, transactions!inner(*)')
    .eq('transactions.artwork.artist_id', artistId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return profiles.map(toGhostProfile)
}

async function createPurchasedWorksCollection(
  profileId: string,
  ghostProfileId: string
) {
  const supabase = createServiceRoleClient()
  
  // Create the "Purchased Works" collection
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .insert({
      name: 'Purchased Works',
      description: 'Your collection of purchased artworks',
      patron_id: profileId,
      is_purchased: true,
      is_private: false
    })
    .select()
    .single()

  if (collectionError) throw collectionError

  // Get all successful transactions for the ghost profile
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, artwork_id, created_at')
    .eq('ghost_profile_id', ghostProfileId)
    .eq('status', 'succeeded')
    .not('artwork_id', 'is', null)

  if (transactions && transactions.length > 0) {
    // Add all purchased artworks to the collection
    const { error: itemsError } = await supabase
      .from('collection_items')
      .insert(
        transactions
          .filter((tx): tx is { id: string; artwork_id: string; created_at: string } => 
            tx.id != null && tx.artwork_id != null && tx.created_at != null
          )
          .map(tx => ({
            collection_id: collection.id,
            artwork_id: tx.artwork_id,
            transaction_id: tx.id,
            notes: `Purchased on ${new Date(tx.created_at).toLocaleDateString()}`,
            added_at: tx.created_at,
            display_order: 0
          }))
      )

    if (itemsError) throw itemsError
  }

  return collection
}

export async function processGuestPurchase(data: GuestPurchaseData) {
  const supabase = createServiceRoleClient()
  
  // 1. Check for existing ghost profile
  let ghostProfile = await getGhostProfileByEmail(data.email)

  // 2. Create ghost profile if doesn't exist
  if (!ghostProfile) {
    ghostProfile = await createGhostProfile(
      data.email,
      data.stripeCustomerId,
      {
        source: 'gallery_purchase',
        first_purchase_date: new Date().toISOString()
      }
    )
  }

  // 3. Create transaction record with ghost profile reference
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      ghost_profile_id: ghostProfile.id,
      artwork_id: data.artworkId,
      stripe_payment_intent_id: data.stripePaymentIntentId,
      amount_total: data.amount.total,
      artist_amount: data.amount.artistAmount,
      platform_fee: data.amount.platformFee,
      status: data.paymentDetails.status,
      billing_email: data.email,
      billing_name: data.paymentDetails.billingName,
      is_gallery_entry: true,
      metadata: {
        purchase_date: new Date().toISOString(),
        source: 'gallery_purchase'
      }
    })
    .select()
    .single()

  if (transactionError) throw transactionError

  // 4. Update ghost profile statistics
  const updatedProfile = await updateGhostProfile(ghostProfile.id, {
    totalPurchases: ghostProfile.totalPurchases + 1,
    totalSpent: ghostProfile.totalSpent + data.amount.total,
    lastPurchaseDate: new Date().toISOString()
  })

  return {
    ghostProfile: updatedProfile,
    transaction: toTransaction(transaction)
  }
}

export async function retryClaimGhostProfile(userId: string) {
  const supabase = createServiceRoleClient();
  
  // Get user's email
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (userError) throw userError;
  if (!user?.email) throw new Error('User email not found');

  // Check for unclaimed ghost profile
  const ghostProfile = await getGhostProfileByEmail(user.email);
  if (!ghostProfile || ghostProfile.isClaimed) {
    return { success: false, message: 'No unclaimed purchases found for your email.' };
  }

  // Claim the ghost profile
  await claimGhostProfile(ghostProfile.id, userId);
  
  return { 
    success: true, 
    message: 'Successfully claimed your previous purchases!' 
  };
} 