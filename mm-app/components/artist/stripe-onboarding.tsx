import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface StripeOnboardingProps {
  stripeAccountId: string | null;
  onboardingComplete: boolean;
}

export function StripeOnboarding({ stripeAccountId, onboardingComplete }: StripeOnboardingProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetupStripe = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (onboardingComplete) {
    return (
      <div className="rounded-lg border p-4 bg-green-50">
        <h3 className="font-semibold text-green-700">Stripe Account Connected</h3>
        <p className="text-sm text-green-600 mt-1">
          Your Stripe account is fully set up and ready to receive payments.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.open('https://connect.stripe.com/express-login', '_blank')}
        >
          View Stripe Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 bg-white">
      <h3 className="font-semibold">
        {stripeAccountId ? 'Complete Your Stripe Setup' : 'Set Up Payments'}
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        {stripeAccountId 
          ? 'Please complete your Stripe account setup to start receiving payments.'
          : 'Connect with Stripe to start selling your artwork and receive payments.'}
      </p>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <Button
        onClick={handleSetupStripe}
        disabled={loading}
        className="mt-4"
      >
        {loading ? 'Loading...' : stripeAccountId ? 'Complete Setup' : 'Connect with Stripe'}
      </Button>
    </div>
  );
} 