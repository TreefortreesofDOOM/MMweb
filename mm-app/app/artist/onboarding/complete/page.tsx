'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default function OnboardingCompletePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to artist dashboard after a short delay
    const timer = setTimeout(() => {
      router.push('/artist/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container max-w-2xl py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          Stripe Account Setup Complete
        </h1>
        <p className="text-center text-gray-600 mb-4">
          Thank you for completing your Stripe account setup. You can now receive payments for your artwork.
        </p>
        <p className="text-center text-sm text-gray-500">
          You will be redirected to your dashboard in a few seconds...
        </p>
      </Card>
    </div>
  );
} 