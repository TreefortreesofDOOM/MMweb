'use server';

import { createActionClient } from '@/lib/supabase/action';
import { trackArtistVerificationProgress } from '@/lib/actions/analytics';
import { headers } from 'next/headers';

export async function checkVerificationRequirements(userId: string) {
  try {
    const supabase = await createActionClient();

    // Get user profile and verification requirements
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        artworks (count)
      `)
      .eq('id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Fetch stripe account separately
    const { data: stripeAccount } = await supabase
      .from('stripe_accounts')
      .select('details_submitted')
      .eq('user_id', userId)
      .single();

    // Check profile completeness
    const hasFullName = Boolean(profile.first_name && profile.last_name);
    const hasBio = Boolean(profile.bio && profile.bio.length >= 100);
    const hasAvatar = Boolean(profile.avatar_url);
    const hasContactInfo = Boolean(profile.website || profile.instagram);

    const profile_complete = {
      complete: hasFullName && hasBio && hasAvatar && hasContactInfo,
      message: !hasFullName
        ? "Add your full name"
        : !hasBio
        ? "Add a bio (at least 100 characters)"
        : !hasAvatar
        ? "Add a profile photo"
        : !hasContactInfo
        ? "Add a website or Instagram link"
        : "Profile complete",
    };

    // Check portfolio quality
    const minimumArtworks = 5;
    const hasMinimumArtworks = (profile.artworks?.[0]?.count || 0) >= minimumArtworks;
    const hasStripeConnected = Boolean(stripeAccount?.details_submitted);

    const portfolio_quality = {
      complete: hasMinimumArtworks && hasStripeConnected,
      message: !hasMinimumArtworks
        ? `Upload at least ${minimumArtworks} artworks`
        : !hasStripeConnected
        ? "Connect your payment account"
        : "Portfolio complete",
    };

    // Check platform engagement
    const minimumDays = 30;
    const minimumViews = 50;
    const accountAgeInDays = Math.floor(
      (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const hasMinimumAge = accountAgeInDays >= minimumDays;
    const hasMinimumViews = (profile.view_count || 0) >= minimumViews;

    const platform_engagement = {
      complete: hasMinimumAge && hasMinimumViews,
      message: !hasMinimumAge
        ? `Account must be ${minimumDays} days old`
        : !hasMinimumViews
        ? `Gain ${minimumViews} profile views`
        : "Engagement complete",
    };

    // Calculate overall progress
    const requirements = {
      profile_complete,
      portfolio_quality,
      platform_engagement,
    };

    const progress = Math.floor(
      (Object.values(requirements).filter((r) => r.complete).length / 3) * 100
    );

    const isVerified = Object.values(requirements).every((r) => r.complete);

    // Track verification progress
    await trackArtistVerificationProgress({
      step: 'requirements_check',
      status: isVerified ? 'completed' : 'started',
      metadata: {
        userId,
        requirements,
        progress,
      }
    });

    return {
      requirements,
      progress,
      isVerified,
    };
  } catch (error) {
    console.error('Error checking verification requirements:', error);
    return {
      requirements: {
        profile_complete: { complete: false, message: "Failed to check requirements" },
        portfolio_quality: { complete: false, message: "Failed to check requirements" },
        platform_engagement: { complete: false, message: "Failed to check requirements" },
      },
      progress: 0,
      isVerified: false,
    };
  }
}

export async function upgradeToVerifiedArtist(userId: string) {
  try {
    const supabase = await createActionClient();

    // Check requirements first
    const { isVerified } = await checkVerificationRequirements(userId);
    if (!isVerified) {
      throw new Error('Verification requirements not met');
    }

    // Update profile to verified artist
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        artist_type: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Track successful verification
    await trackArtistVerificationProgress({
      step: 'verification_complete',
      status: 'completed',
      metadata: {
        userId,
        verifiedAt: new Date().toISOString()
      }
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error upgrading to verified artist:', error);
    return { success: false, error: 'Failed to upgrade to verified artist' };
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