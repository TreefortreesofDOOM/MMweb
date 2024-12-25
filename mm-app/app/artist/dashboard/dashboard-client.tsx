'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface DashboardClientProps {
  profile: {
    stripe_account_id: string | null;
    stripe_onboarding_complete: boolean;
  };
}

export function DashboardClient({ profile }: DashboardClientProps) {
  const needsStripeConnect = !profile.stripe_account_id;
  const needsStripeOnboarding = !profile.stripe_onboarding_complete;

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Artist Dashboard</h1>
        <Button asChild>
          <Link href="/artist/artworks/new">
            Upload New Artwork
          </Link>
        </Button>
      </div>

      {/* Stripe Setup Alert */}
      {(needsStripeConnect || needsStripeOnboarding) && (
        <Card className="mb-8 bg-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Complete Your Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              To start selling your artwork, you need to connect your Stripe account for payments.
            </p>
            <Button asChild variant="default">
              <Link href="/artist/connect">
                {needsStripeConnect ? 'Connect Stripe Account' : 'Complete Stripe Onboarding'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Artworks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0" asChild>
              <Link href="/artist/artworks">
                Manage Artworks →
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sales & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0" asChild>
              <Link href="/artist/sales">
                View Reports →
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profile & Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0" asChild>
              <Link href="/profile">
                Edit Profile →
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Artist Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-muted-foreground">
            <p>• Photography Guidelines</p>
            <p>• Pricing Strategies</p>
            <p>• Marketing Tips</p>
            <p>• Community Forum</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 