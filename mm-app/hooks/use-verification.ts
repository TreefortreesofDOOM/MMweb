'use client';

import { useCallback, useMemo, useEffect } from "react";
import { useArtist } from "./use-artist";
import { checkVerificationRequirements } from "@/lib/actions/verification";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/types/database.types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface VerificationRequirement {
  complete: boolean;
  message: string;
}

interface VerificationCheck {
  profile: Profile;
  artworkCount: number;
  publishedArtworkCount: number;
  accountAgeInDays: number;
  profileViews: number;
}

interface VerificationStatus {
  requirements: {
    profile_complete: VerificationRequirement;
    portfolio_quality: VerificationRequirement;
    platform_engagement: VerificationRequirement;
  };
  progress: number;
  isVerified: boolean;
  isExhibitionArtist: boolean;
}

const MIN_BIO_LENGTH = 100;
const MIN_ARTWORKS = 5;
const MIN_PUBLISHED_ARTWORKS = 3;
const MIN_ACCOUNT_AGE_DAYS = 30;
const MIN_PROFILE_VIEWS = 50;

export const useVerification = () => {
  const { profile } = useArtist();
  const router = useRouter();

  const checkProfileComplete = useCallback(
    (check: VerificationCheck): VerificationRequirement => {
      const { profile } = check;
      const hasFullName = Boolean(profile.first_name && profile.last_name);
      const hasBio = Boolean(profile.bio && profile.bio.length >= MIN_BIO_LENGTH);
      const hasAvatar = Boolean(profile.avatar_url);
      const hasSocialLink = Boolean(profile.instagram || profile.website);

      return {
        complete: hasFullName && hasBio && hasAvatar && hasSocialLink,
        message: !hasFullName
          ? "Add your full name"
          : !hasBio
          ? `Add a bio (at least ${MIN_BIO_LENGTH} characters)`
          : !hasAvatar
          ? "Add a profile photo"
          : !hasSocialLink
          ? "Add Instagram or website link"
          : "Profile complete",
      };
    },
    []
  );

  const checkPortfolioQuality = useCallback(
    (check: VerificationCheck): VerificationRequirement => {
      const { artworkCount, publishedArtworkCount } = check;
      const hasMinArtworks = artworkCount >= MIN_ARTWORKS;
      const hasMinPublished = publishedArtworkCount >= MIN_PUBLISHED_ARTWORKS;

      return {
        complete: hasMinArtworks && hasMinPublished,
        message: !hasMinArtworks
          ? `Upload at least ${MIN_ARTWORKS} artworks`
          : !hasMinPublished
          ? `Publish at least ${MIN_PUBLISHED_ARTWORKS} artworks`
          : "Portfolio complete",
      };
    },
    []
  );

  const checkPlatformEngagement = useCallback(
    (check: VerificationCheck): VerificationRequirement => {
      const { accountAgeInDays, profileViews } = check;
      const hasMinAge = accountAgeInDays >= MIN_ACCOUNT_AGE_DAYS;
      const hasMinViews = profileViews >= MIN_PROFILE_VIEWS;

      return {
        complete: hasMinAge && hasMinViews,
        message: !hasMinAge
          ? `Account must be ${MIN_ACCOUNT_AGE_DAYS} days old`
          : !hasMinViews
          ? `Gain ${MIN_PROFILE_VIEWS} profile views`
          : "Engagement complete",
      };
    },
    []
  );

  const verificationStatus = useMemo((): VerificationStatus | null => {
    if (!profile) {
      console.log('[useVerification] No profile found');
      return null;
    }

    console.log('[useVerification] Profile check:', {
      role: profile.role,
      artworkCount: profile.artworks?.[0]?.count ?? 0,
      viewCount: profile.view_count ?? 0,
      engagementScore: profile.community_engagement_score ?? 0
    });

    const artworkCount = profile.artworks?.[0]?.count ?? 0;
    const check: VerificationCheck = {
      profile,
      artworkCount,
      publishedArtworkCount: artworkCount,
      accountAgeInDays: Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
      profileViews: profile.view_count ?? 0,
    };

    const requirements = {
      profile_complete: checkProfileComplete(check),
      portfolio_quality: checkPortfolioQuality(check),
      platform_engagement: checkPlatformEngagement(check),
    };

    const progress = Math.floor(
      (Object.values(requirements).filter((r) => r.complete).length / Object.keys(requirements).length) *
        100
    );

    console.log('[useVerification] Status check:', {
      progress,
      isVerified: profile.role === 'verified_artist',
      requirementsSummary: {
        profile: requirements.profile_complete.complete,
        portfolio: requirements.portfolio_quality.complete,
        engagement: requirements.platform_engagement.complete
      }
    });

    return {
      requirements,
      progress,
      isVerified: profile.role === 'verified_artist',
      isExhibitionArtist: profile.role === 'verified_artist' && Boolean(profile.exhibition_badge),
    };
  }, [profile, checkProfileComplete, checkPortfolioQuality, checkPlatformEngagement]);

  // Check verification requirements on the server when status changes
  useEffect(() => {
    if (profile?.role === 'emerging_artist') {
      console.log('[useVerification] Checking requirements for emerging artist:', profile.id);
      checkVerificationRequirements(profile.id).then(({ isVerified }) => {
        console.log('[useVerification] Requirements check result:', { isVerified });
        if (isVerified) {
          router.refresh();
        }
      });
    }
  }, [profile, router]);

  return {
    verificationStatus,
    checkProfileComplete,
    checkPortfolioQuality,
    checkPlatformEngagement,
  };
}; 