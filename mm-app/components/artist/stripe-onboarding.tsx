'use client'

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { isAnyArtist, isVerifiedArtist } from '@/lib/utils/auth/role-utils';
import type { UserRole } from '@/lib/types/custom-types';

interface StripeOnboardingProps {
  readonly stripeAccountId: string | null;
  readonly onboardingComplete: boolean;
  readonly userRole: UserRole;
}

export function StripeOnboarding({ 
  stripeAccountId, 
  onboardingComplete,
  userRole 
}: StripeOnboardingProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Early return if not a verified artist
  if (!isVerifiedArtist(userRole)) {
    return null;
  }

  const handleSetupStripe = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create Stripe account');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error setting up Stripe:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/login-link', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to access Stripe dashboard');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error accessing Stripe dashboard:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!stripeAccountId) {
    return (
      <Button 
        onClick={handleSetupStripe} 
        disabled={loading}
        aria-label="Set up Stripe account for payments"
      >
        {loading ? 'Setting up...' : 'Set up Stripe'}
      </Button>
    );
  }

  if (!onboardingComplete) {
    return (
      <Button 
        onClick={handleSetupStripe}
        disabled={loading}
        aria-label="Complete Stripe onboarding"
      >
        {loading ? 'Loading...' : 'Complete Onboarding'}
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleOpenDashboard}
      disabled={loading}
      aria-label="Open Stripe dashboard"
    >
      {loading ? 'Loading...' : 'Open Stripe Dashboard'}
    </Button>
  );
} 