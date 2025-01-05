import { createActionClient } from '@/lib/supabase/supabase-action-utils'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { stripe } from '@/lib/stripe/stripe-server-utils'
import type { GhostProfile, StripeTransaction, PaymentStatus } from '@/lib/types/ghost-profiles'
import { toGhostProfile, toTransaction } from '@/lib/types/ghost-profiles'

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
      metadata
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
  const { data: ghostProfile, error: fetchError } = await supabase
    .from('ghost_profiles')
    .select('*')
    .eq('id', ghostProfileId)
    .single()

  if (fetchError) throw fetchError
  if (!ghostProfile) throw new Error('Ghost profile not found')

  // Start a transaction to update both tables
  const { data: profile, error: profileError } = await supabase
    .from('ghost_profiles')
    .update({
      is_claimed: true,
      claimed_profile_id: profileId
    })
    .eq('id', ghostProfileId)
    .select()
    .single()

  if (profileError) throw profileError

  // Update the user's profile with the ghost profile data
  const { error: userProfileError } = await supabase
    .from('profiles')
    .update({
      total_purchases: ghostProfile.total_purchases,
      total_spent: ghostProfile.total_spent,
      ghost_profile_claimed: true,
      last_purchase_date: ghostProfile.last_purchase_date,
    })
    .eq('id', profileId)

  if (userProfileError) throw userProfileError

  // Update all transactions to link to the claimed profile
  const { error: transactionError } = await supabase
    .from('transactions')
    .update({
      buyer_id: profileId
    })
    .eq('ghost_profile_id', ghostProfileId)

  if (transactionError) throw transactionError

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