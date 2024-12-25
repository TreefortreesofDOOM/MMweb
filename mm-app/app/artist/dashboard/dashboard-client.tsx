'use client';

import { StripeOnboarding } from '@/components/artist/stripe-onboarding';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface DashboardClientProps {
  profile: {
    stripe_account_id: string | null;
    stripe_onboarding_complete: boolean;
  };
}

export function DashboardClient({ profile }: DashboardClientProps) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Handle Stripe redirect results
    if (searchParams.get('success') === 'true') {
      toast.success('Stripe account setup completed successfully');
    } else if (searchParams.get('error') === 'refresh') {
      toast.error('Stripe setup session expired. Please try again.');
    }
  }, [searchParams]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Artist Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stripe Onboarding Section */}
        <div className="col-span-2">
          <h2 className="text-xl font-semibold mb-4">Payment Setup</h2>
          <StripeOnboarding
            stripeAccountId={profile.stripe_account_id}
            onboardingComplete={profile.stripe_onboarding_complete}
          />
        </div>

        {/* Stats Overview */}
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Artworks</h2>
          <p className="text-2xl font-bold">Coming Soon</p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Sales</h2>
          <p className="text-2xl font-bold">Coming Soon</p>
        </div>

        {/* Recent Activity */}
        <div className="col-span-2 rounded-lg border p-4">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
} 