'use client';

import { useArtist } from '@/hooks/use-artist';
import type { ArtistFeatures } from '@/lib/types/custom-types';

interface FeatureConfig {
  requiresVerification?: boolean;
  minimumArtworks?: number;
  requiresStripe?: boolean;
}

export function useFeatureAccess() {
  const { 
    isVerifiedArtist, 
    isEmergingArtist, 
    profile, 
    features,
    verificationProgress 
  } = useArtist();

  const canAccess = (featureName: keyof ArtistFeatures | string, config?: FeatureConfig): boolean => {
    try {
      // If not an artist at all, no access
      if (!isVerifiedArtist && !isEmergingArtist) return false;

      // If no features available, default to false
      if (!features) return false;

      // If feature requires verification and user is not verified, no access
      if (config?.requiresVerification && !isVerifiedArtist) return false;

      // Check artwork count requirement if specified
      if (config?.minimumArtworks !== undefined) {
        const artworkCount = profile?.artworks?.[0]?.count || 0;
        if (artworkCount < config.minimumArtworks) return false;
      }

      // Check Stripe requirement if specified
      if (config?.requiresStripe && !profile?.stripe_onboarding_complete) return false;

      // Check feature-specific access
      if (featureName in features) {
        const hasAccess = features[featureName as keyof ArtistFeatures];
        return Boolean(hasAccess);
      }

      // Default to true for verified artists, false for emerging
      return isVerifiedArtist;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  };

  const getRequirements = (featureName: string): string[] => {
    try {
      const requirements: string[] = [];

      if (!isVerifiedArtist && !isEmergingArtist) {
        requirements.push('Artist account required');
        return requirements;
      }

      if (!features) {
        requirements.push('Feature access not configured');
        return requirements;
      }

      const artworkCount = profile?.artworks?.[0]?.count || 0;

      if (!isVerifiedArtist && features.stripeRequirements.required) {
        requirements.push('Verified artist status required');
      }

      if (features.stripeRequirements.required && !profile?.stripe_onboarding_complete) {
        requirements.push('Stripe account setup required');
      }

      if (artworkCount < features.stripeRequirements.minimumArtworks) {
        requirements.push(`Minimum ${features.stripeRequirements.minimumArtworks} artworks required`);
      }

      return requirements;
    } catch (error) {
      console.error('Error getting feature requirements:', error);
      return ['Unable to determine requirements'];
    }
  };

  return {
    canAccess,
    getRequirements,
    features,
    verificationProgress,
  };
} 