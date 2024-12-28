'use client';

import { useCallback, useMemo, useEffect } from "react";
import { useArtist } from "./use-artist";
import { checkVerificationRequirements } from "@/lib/actions/verification";
import { useRouter } from "next/navigation";
import type { Database } from "@/lib/database.types";

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
    if (!profile) return null;

    const artworkCount = profile.artworks?.[0]?.count ?? 0;
    const check: VerificationCheck = {
      profile,
      artworkCount,
      publishedArtworkCount: artworkCount, // We'll need to add a published count to the profile query
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

    return {
      requirements,
      progress,
      isVerified: profile.artist_type === "verified",
      isExhibitionArtist: profile.artist_type === "verified" && Boolean(profile.exhibition_badge),
    };
  }, [profile, checkProfileComplete, checkPortfolioQuality, checkPlatformEngagement]);

  // Check verification requirements on the server when status changes
  useEffect(() => {
    if (profile && !profile.artist_type) {
      checkVerificationRequirements(profile.id).then(({ verified }) => {
        if (verified) {
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