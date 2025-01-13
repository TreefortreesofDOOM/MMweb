'use server';

import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getGhostProfileByEmail, claimGhostProfile } from './ghost-profiles';
import type { Database } from '@/lib/types/database.types';

interface UserPurchaseData {
  userId: string;
  artworkId: string;
  stripePaymentIntentId: string;
  amount: {
    total: number;
    artistAmount: number;
    platformFee: number;
  };
  paymentDetails: {
    status: Database['public']['Enums']['payment_status'];
    billingEmail: string;
    billingName: string;
  };
}

export async function processUserPurchase(data: UserPurchaseData) {
  const supabase = createServiceRoleClient();
  
  // 1. Create transaction record
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      buyer_id: data.userId,
      artwork_id: data.artworkId,
      stripe_payment_intent_id: data.stripePaymentIntentId,
      amount_total: data.amount.total,
      artist_amount: data.amount.artistAmount,
      platform_fee: data.amount.platformFee,
      status: data.paymentDetails.status,
      billing_email: data.paymentDetails.billingEmail,
      billing_name: data.paymentDetails.billingName,
      is_gallery_entry: true,
      metadata: {
        purchase_date: new Date().toISOString(),
        source: 'store_purchase'
      }
    })
    .select()
    .single();

  if (transactionError) throw transactionError;

  // The add_artwork_to_collection trigger will automatically:
  // 1. Create or get the "Purchased Works" collection
  // 2. Add the artwork to the collection
  // 3. Update purchase statistics

  return transaction;
}

export async function retryClaimGhostProfileAction(userId: string) {
  const supabase = createServiceRoleClient();
  
  try {
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
  } catch (error) {
    console.error('Error in retryClaimGhostProfileAction:', error);
    return { 
      success: false, 
      message: 'Failed to check for previous purchases. Please try again.' 
    };
  }
} 