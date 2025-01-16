import { trackEvent } from './analytics';

// Types
export type VerificationStep = 
  | 'requirements_check'
  | 'profile_complete'
  | 'portfolio_complete'
  | 'engagement_threshold'
  | 'verification_complete';

export type VerificationStatus = 'started' | 'in_progress' | 'completed' | 'failed';

export interface VerificationDetails {
  profileComplete: boolean;
  portfolioComplete: boolean;
  engagementScore: number;
  artworkCount: number;
  publishedArtworkCount: number;
  accountAgeDays: number;
  profileViews: number;
}

export interface VerificationProgressEvent {
  step: VerificationStep;
  status: VerificationStatus;
  metadata: {
    userId: string;
    verifiedAt?: string;
    verificationDetails: VerificationDetails;
  };
}

// Main tracking function
export async function trackVerificationProgress(event: VerificationProgressEvent) {
  try {
    await trackEvent({
      userId: event.metadata.userId,
      eventType: 'artist_verification',
      eventName: `${event.step}_${event.status}`,
      eventData: {
        step: event.step,
        status: event.status,
        verifiedAt: event.metadata.verifiedAt,
        verificationDetails: event.metadata.verificationDetails
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking verification progress:', error);
    return { success: false, error };
  }
}

// Helper functions for common verification events
export async function trackVerificationComplete(userId: string, verificationDetails: VerificationDetails) {
  return trackVerificationProgress({
    step: 'verification_complete',
    status: 'completed',
    metadata: {
      userId,
      verifiedAt: new Date().toISOString(),
      verificationDetails
    }
  });
}

export async function trackRequirementsCheck(userId: string, verificationDetails: VerificationDetails, passed: boolean) {
  return trackVerificationProgress({
    step: 'requirements_check',
    status: passed ? 'completed' : 'failed',
    metadata: {
      userId,
      verificationDetails
    }
  });
}

export async function trackProfileComplete(userId: string, verificationDetails: VerificationDetails) {
  return trackVerificationProgress({
    step: 'profile_complete',
    status: 'completed',
    metadata: {
      userId,
      verificationDetails
    }
  });
}

export async function trackPortfolioComplete(userId: string, verificationDetails: VerificationDetails) {
  return trackVerificationProgress({
    step: 'portfolio_complete',
    status: 'completed',
    metadata: {
      userId,
      verificationDetails
    }
  });
}

export async function trackEngagementThreshold(userId: string, verificationDetails: VerificationDetails) {
  return trackVerificationProgress({
    step: 'engagement_threshold',
    status: 'completed',
    metadata: {
      userId,
      verificationDetails
    }
  });
} 