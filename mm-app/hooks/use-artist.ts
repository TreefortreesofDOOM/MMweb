'use client';

import { useAuth } from '@/hooks/use-auth';
import { ARTIST_ROLES, type ArtistProfile, type ArtistFeatures, type VerificationRequirements } from '@/lib/types/custom-types';

type ArtistWithCount = ArtistProfile & {
  artworks: [{
    count: number;
  }];
};

const DEFAULT_FEATURES: ArtistFeatures = {
  maxArtworks: 10,
  canAccessGallery: false,
  canAccessAnalytics: false,
  canAccessMessaging: false,
  stripeRequirements: {
    required: false,
    minimumArtworks: 5
  }
};

const DEFAULT_VERIFICATION_REQUIREMENTS: VerificationRequirements = {
  minimumArtworks: 5,
  portfolioComplete: false,
  bioComplete: false,
  contactInfoComplete: false,
  stripeConnected: false
};

export function useArtist() {
  const { profile: baseProfile, isVerifiedArtist, isEmergingArtist, isArtist } = useAuth();
  const profile = baseProfile as ArtistWithCount | null;

  const getFeatureAccess = (): ArtistFeatures => {
    if (!profile || !isArtist) {
      return {
        maxArtworks: 0,
        canAccessGallery: false,
        canAccessAnalytics: false,
        canAccessMessaging: false,
        stripeRequirements: {
          required: false,
          minimumArtworks: 0,
        },
      };
    }

    if (isVerifiedArtist) {
      return {
        maxArtworks: Infinity,
        canAccessGallery: true,
        canAccessAnalytics: true,
        canAccessMessaging: true,
        stripeRequirements: {
          required: true,
          minimumArtworks: 5,
        },
      };
    }

    // Emerging artist features
    return DEFAULT_FEATURES;
  };

  const getVerificationProgress = () => {
    if (!profile) return DEFAULT_VERIFICATION_REQUIREMENTS;

    return {
      minimumArtworks: 5,
      portfolioComplete: false,
      bioComplete: !!profile.bio,
      contactInfoComplete: !!(profile.website || profile.instagram),
      stripeConnected: false,
    };
  };

  const canUploadArtwork = () => {
    const features = getFeatureAccess();
    if (!profile || !isArtist) return false;

    // For verified artists, no limit
    if (isVerifiedArtist) return true;

    // For emerging artists, check the artwork count
    return (profile.artworks?.[0]?.count || 0) < features.maxArtworks;
  };

  const getVerificationStatus = () => {
    if (!isArtist) return 'not_artist';
    if (isVerifiedArtist) return 'verified';
    
    const verificationProgress = getVerificationProgress();
    if (!verificationProgress) return 'not_started';
    
    const requirements = Object.entries(verificationProgress);
    const completedRequirements = requirements.filter(([_, value]) => value).length;
    const totalRequirements = requirements.length;
    
    if (completedRequirements === totalRequirements) return 'ready_for_review';
    if (completedRequirements > 0) return 'in_progress';
    return 'not_started';
  };

  const getVerificationPercentage = () => {
    if (!isArtist) return 0;
    if (isVerifiedArtist) return 100;

    const verificationProgress = getVerificationProgress();
    if (!verificationProgress) return 0;

    const requirements = Object.entries(verificationProgress);
    const completedRequirements = requirements.filter(([_, value]) => value).length;
    const totalRequirements = requirements.length;

    return Math.round((completedRequirements / totalRequirements) * 100);
  };

  return {
    profile,
    isVerifiedArtist,
    isEmergingArtist,
    isArtist,
    features: getFeatureAccess(),
    verificationProgress: getVerificationProgress(),
    canUploadArtwork,
    getVerificationStatus,
    getVerificationPercentage,
  };
} 