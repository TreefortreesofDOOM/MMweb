'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArtistAssistant } from '@/components/ai/artist-assistant';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DashboardClientProps {
  artworks: Array<{
    id: string;
    status: string;
  }>;
  profile: {
    stripe_account_id?: string | null;
    stripe_onboarding_complete?: boolean;
  };
}

export default function DashboardClient({ artworks, profile }: DashboardClientProps) {
  const totalArtworks = artworks.length;
  const publishedArtworks = artworks.filter(a => a.status === 'published').length;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Artist Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your artworks and track your performance
          </p>
        </div>
        <Button asChild>
          <Link href="/artist/artworks/new">Upload New Artwork</Link>
        </Button>
      </div>

      {/* Stripe Setup Alert */}
      {!profile.stripe_account_id && (
        <Alert>
          <AlertTitle>Set up payments to start selling</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Connect your Stripe account to receive payments for your artwork sales.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/api/stripe/connect">
                Connect with Stripe
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {profile.stripe_account_id && !profile.stripe_onboarding_complete && (
        <Alert>
          <AlertTitle>Complete your Stripe onboarding</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Please complete your Stripe account setup to start receiving payments.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/api/stripe/connect">
                Complete Setup
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Artworks</p>
                <p className="text-2xl font-bold">{totalArtworks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{publishedArtworks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/artist/artworks/new">
                Upload New Artwork
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/artist/artworks">
                Manage Artworks
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* AI Artist Assistant */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>AI Artist Assistant</CardTitle>
            <CardDescription>
              Get help with portfolio management, artwork descriptions, and professional development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ArtistAssistant />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 