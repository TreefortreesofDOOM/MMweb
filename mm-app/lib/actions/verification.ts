'use server';

import { createActionClient } from '@/lib/supabase/action';
import { headers } from 'next/headers';
import type { VerificationRequirements } from '@/lib/types/custom-types';

export async function checkVerificationRequirements(userId: string) {
  try {
    const supabase = await createActionClient();

    // Get profile and artworks count
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { count: artworksCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', userId);

    const MINIMUM_ARTWORKS_REQUIRED = 3;

    const progress = {
      minimumArtworks: MINIMUM_ARTWORKS_REQUIRED,
      portfolioComplete: Boolean(profile?.portfolio_complete),
      bioComplete: Boolean(profile?.bio),
      contactInfoComplete: Boolean(profile?.email || profile?.phone),
      stripeConnected: Boolean(profile?.stripe_account_id)
    };

    // Check if all requirements are met
    const verified = (artworksCount ?? 0) >= MINIMUM_ARTWORKS_REQUIRED &&
      progress.portfolioComplete &&
      progress.bioComplete &&
      progress.contactInfoComplete &&
      progress.stripeConnected;

    return { verified, progress, error: null };
  } catch (error) {
    console.error('Error checking verification:', error);
    return { verified: false, progress: null, error: 'Failed to check verification status' };
  }
}

export async function resendVerificationEmail() {
  try {
    const supabase = await createActionClient();
    const origin = (await headers()).get("origin");

    // Get current user's email
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      return { error: "No user email found. Please try signing in again." };
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${origin}/callback`
      }
    });

    if (error) {
      console.error('Error resending verification email:', error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in resendVerificationEmail:', error);
    return { error: 'Failed to resend verification email' };
  }
} 