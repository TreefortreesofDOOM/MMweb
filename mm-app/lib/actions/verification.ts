'use server';

import { createActionClient } from '@/lib/supabase/action';
import { revalidatePath } from 'next/cache';

const MIN_BIO_LENGTH = 100;
const MIN_ARTWORKS = 5;
const MIN_PUBLISHED_ARTWORKS = 3;
const MIN_ACCOUNT_AGE_DAYS = 30;
const MIN_PROFILE_VIEWS = 50;

export async function checkVerificationRequirements(userId: string) {
  const supabase = await createActionClient();

  try {
    // Get profile with artwork count
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        *,
        artworks:artworks(count)
      `)
      .eq('id', userId)
      .single();

    if (!profile) {
      return { error: 'Profile not found' };
    }

    // Check if already verified
    if (profile.artist_type === 'verified') {
      return { verified: true };
    }

    // Get published artwork count
    const { count: publishedCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', userId)
      .eq('status', 'published');

    // Calculate account age
    const accountAgeInDays = Math.floor(
      (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check requirements
    const hasFullName = Boolean(profile.first_name && profile.last_name);
    const hasBio = Boolean(profile.bio && profile.bio.length >= MIN_BIO_LENGTH);
    const hasAvatar = Boolean(profile.avatar_url);
    const hasSocialLink = Boolean(profile.instagram || profile.website);
    const hasMinArtworks = (profile.artworks?.[0]?.count ?? 0) >= MIN_ARTWORKS;
    const hasMinPublished = (publishedCount ?? 0) >= MIN_PUBLISHED_ARTWORKS;
    const hasMinAge = accountAgeInDays >= MIN_ACCOUNT_AGE_DAYS;
    const hasMinViews = (profile.view_count ?? 0) >= MIN_PROFILE_VIEWS;

    const requirements = {
      profile_complete: hasFullName && hasBio && hasAvatar && hasSocialLink,
      portfolio_quality: hasMinArtworks && hasMinPublished,
      platform_engagement: hasMinAge && hasMinViews,
    };

    const progress = Math.floor(
      (Object.values(requirements).filter(Boolean).length / Object.keys(requirements).length) * 100
    );

    // Update verification progress
    await supabase
      .from('profiles')
      .update({
        verification_progress: progress,
        verification_requirements: {
          portfolio_complete: requirements.profile_complete,
          identity_verified: true, // Always true since we verify through auth
          gallery_connection: false, // Set by admin
          sales_history: false, // Set by system based on sales
          community_engagement: requirements.platform_engagement,
        },
      })
      .eq('id', userId);

    // If all requirements are met, upgrade to verified artist
    const allRequirementsMet = Object.values(requirements).every(Boolean);
    if (allRequirementsMet) {
      await supabase
        .from('profiles')
        .update({
          artist_type: 'verified',
          verification_progress: 100,
        })
        .eq('id', userId);

      revalidatePath('/artist/verification');
      revalidatePath('/profile');
      return { verified: true, progress: 100 };
    }

    return { verified: false, progress };
  } catch (error: any) {
    console.error('Error checking verification:', error);
    return { error: error.message };
  }
} 