'use server';

import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import { headers } from 'next/headers';
import { 
  trackVerificationComplete, 
  trackRequirementsCheck,
  trackProfileComplete,
  trackPortfolioComplete,
  trackEngagementThreshold,
  type VerificationDetails 
} from '@/lib/analytics/verification-tracking';

export async function checkVerificationRequirements(userId: string) {
  try {
    const supabase = await createActionClient();

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        full_name,
        bio,
        avatar_url,
        social_links,
        community_engagement_score,
        created_at,
        profile_views
      `)
      .eq('id', userId)
      .single();

    // Get artwork counts
    const { data: artworks } = await supabase
      .from('artworks')
      .select('status')
      .eq('artist_id', userId);

    const totalArtworks = artworks?.length || 0;
    const publishedArtworks = artworks?.filter(a => a.status === 'published').length || 0;

    // Calculate account age in days
    const accountAgeDays = profile?.created_at 
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Check requirements
    const profileComplete = !!(
      profile?.full_name &&
      profile?.bio?.length >= 100 &&
      profile?.avatar_url &&
      profile?.social_links?.length > 0
    );

    const portfolioComplete = publishedArtworks >= 5;
    const engagementComplete = (
      accountAgeDays >= 30 &&
      (profile?.profile_views || 0) >= 50 &&
      (profile?.community_engagement_score || 0) >= 50
    );

    const verificationDetails: VerificationDetails = {
      profileComplete,
      portfolioComplete,
      engagementScore: profile?.community_engagement_score || 0,
      artworkCount: totalArtworks,
      publishedArtworkCount: publishedArtworks,
      accountAgeDays,
      profileViews: profile?.profile_views || 0
    };

    const isVerified = profileComplete && portfolioComplete && engagementComplete;

    // Track the check
    await trackRequirementsCheck(userId, verificationDetails, isVerified);

    // Track individual completions
    if (profileComplete) await trackProfileComplete(userId, verificationDetails);
    if (portfolioComplete) await trackPortfolioComplete(userId, verificationDetails);
    if (engagementComplete) await trackEngagementThreshold(userId, verificationDetails);

    return {
      isVerified,
      details: verificationDetails
    };
  } catch (error) {
    console.error('Error checking verification requirements:', error);
    return { isVerified: false, details: null, error };
  }
}

export async function upgradeToVerifiedArtist(userId: string) {
  try {
    const supabase = await createActionClient();

    // Check requirements first
    const { isVerified, details } = await checkVerificationRequirements(userId);
    if (!isVerified || !details) {
      throw new Error('Verification requirements not met');
    }

    // Update profile to verified artist
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'verified_artist',
        verified_at: new Date().toISOString(),
        application_status: 'approved'
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Track successful verification
    await trackVerificationComplete(userId, details);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error upgrading to verified artist:', error);
    return { success: false, error: 'Failed to upgrade to verified artist' };
  }
}

// New function to track community engagement
export async function updateCommunityEngagement(userId: string, action: 'follow' | 'like' | 'comment' | 'share') {
  try {
    const supabase = await createActionClient();
    
    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    // Only track engagement for emerging artists
    if (!profile || profile.role !== 'emerging_artist') {
      return { success: false, error: 'Only emerging artists can earn engagement points' };
    }

    // Get the updated score after the action triggers have run
    const { data: updatedProfile, error: scoreError } = await supabase
      .from('profiles')
      .select('community_engagement_score')
      .eq('id', userId)
      .single();

    if (scoreError) throw scoreError;

    const newScore = updatedProfile?.community_engagement_score || 0;

    // Trigger verification check if score reaches threshold
    if (newScore >= 50) {
      await checkVerificationRequirements(userId);
    }

    return { success: true, newScore };
  } catch (error) {
    console.error('Error updating community engagement:', error);
    return { success: false, error: 'Failed to update engagement score' };
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