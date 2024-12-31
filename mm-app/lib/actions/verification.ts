'use server';

import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import { headers } from 'next/headers';
import { trackArtistVerificationProgress } from '@/lib/actions/analytics';

export async function checkVerificationRequirements(userId: string) {
  try {
    const supabase = await createActionClient();

    // Get user profile with essential fields only
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        role,
        verification_status,
        verification_progress,
        verification_requirements,
        first_name,
        last_name,
        bio,
        avatar_url,
        website,
        instagram,
        view_count,
        created_at,
        community_engagement_score
      `)
      .eq('id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    if (!profile || profile.role !== 'emerging_artist') {
      return {
        requirements: {
          profile_complete: { complete: false, message: "Must be an emerging artist" },
          portfolio_quality: { complete: false, message: "Must be an emerging artist" },
          platform_engagement: { complete: false, message: "Must be an emerging artist" }
        },
        progress: 0,
        isVerified: false,
        details: null
      };
    }

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
      details: {
        hasFullName,
        hasBio,
        hasAvatar,
        hasContactInfo
      }
    };

    // Check portfolio quality
    const { count: artworkCount } = await supabase
      .from('artworks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    const minimumArtworks = 5;
    const hasMinimumArtworks = (artworkCount || 0) >= minimumArtworks;

    const portfolio_quality = {
      complete: hasMinimumArtworks,
      message: !hasMinimumArtworks
        ? `Upload at least ${minimumArtworks} artworks`
        : "Portfolio complete",
      details: {
        hasMinimumArtworks,
        currentCount: artworkCount || 0
      }
    };

    // Check platform engagement
    const minimumDays = 30;
    const minimumViews = 50;
    const accountAgeInDays = Math.floor(
      (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const hasMinimumAge = accountAgeInDays >= minimumDays;
    const hasMinimumViews = (profile.view_count || 0) >= minimumViews;
    const hasCommunityEngagement = Boolean(profile.community_engagement_score >= 50);

    const platform_engagement = {
      complete: hasMinimumAge && hasMinimumViews && hasCommunityEngagement,
      message: !hasMinimumAge
        ? `Account must be ${minimumDays} days old (${accountAgeInDays} days currently)`
        : !hasMinimumViews
        ? `Gain ${minimumViews} profile views (${profile.view_count || 0} currently)`
        : !hasCommunityEngagement
        ? "Increase your community engagement"
        : "Engagement complete",
      details: {
        hasMinimumAge,
        hasMinimumViews,
        hasCommunityEngagement,
        currentAge: accountAgeInDays,
        currentViews: profile.view_count || 0,
        engagementScore: profile.community_engagement_score || 0
      }
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

    // Update verification progress in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_requirements: {
          profile_complete: profile_complete.details,
          portfolio_quality: portfolio_quality.details,
          platform_engagement: platform_engagement.details
        },
        verification_progress: progress,
        verification_status: isVerified ? 'verified' : 'in_progress'
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return {
      requirements,
      progress,
      isVerified,
      details: {
        profile: profile_complete.details,
        portfolio: portfolio_quality.details,
        engagement: platform_engagement.details
      }
    };
  } catch (error) {
    console.error('Error checking verification requirements:', error);
    return {
      requirements: {
        profile_complete: { complete: false, message: "Failed to check requirements" },
        portfolio_quality: { complete: false, message: "Failed to check requirements" },
        platform_engagement: { complete: false, message: "Failed to check requirements" }
      },
      progress: 0,
      isVerified: false,
      details: null
    };
  }
}

export async function upgradeToVerifiedArtist(userId: string) {
  try {
    const supabase = await createActionClient();

    // Check requirements first
    const { isVerified, details } = await checkVerificationRequirements(userId);
    if (!isVerified) {
      throw new Error('Verification requirements not met');
    }

    // Update profile to verified artist
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'verified_artist',
        verified_at: new Date().toISOString(),
        verification_status: 'verified'
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Track successful verification
    await trackArtistVerificationProgress({
      step: 'verification_complete',
      status: 'completed',
      metadata: {
        userId,
        verifiedAt: new Date().toISOString(),
        verificationDetails: details
      }
    });

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