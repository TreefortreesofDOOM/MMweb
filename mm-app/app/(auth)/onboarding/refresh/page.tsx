'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OnboardingRefreshPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh onboarding session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error refreshing onboarding:', error);
      // You might want to show an error toast here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          Session Expired
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Your Stripe onboarding session has expired. Please click below to start a new session.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={handleRetry}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Retry Setup'}
          </Button>
        </div>
      </Card>
    </div>
  );
} 