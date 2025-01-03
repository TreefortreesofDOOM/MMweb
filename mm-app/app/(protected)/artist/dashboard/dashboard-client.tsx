'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StripeOnboarding } from '@/components/artist/stripe-onboarding';
import { FeatureComingSoon } from '@/components/artist/feature-coming-soon';
import { Progress } from "@/components/ui/progress";
import { useArtist } from "@/hooks/use-artist";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useCallback } from "react";

interface DashboardClientProps {
  artworks: Array<{
    id: string;
    status: string;
  }>;
  profile: {
    stripe_account_id?: string | null;
    stripe_onboarding_complete?: boolean;
    role?: string;
    exhibition_badge?: boolean | null;
  };
}

export default function DashboardClient({ artworks, profile }: DashboardClientProps) {
  const { isVerifiedArtist, isEmergingArtist, getVerificationStatus, getVerificationPercentage } = useArtist();
  const totalArtworks = artworks.length;
  const publishedArtworks = artworks.filter(a => a.status === 'published').length;
  const verificationProgress = getVerificationPercentage();
  const verificationStatus = getVerificationStatus();

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (e.target as HTMLElement).click();
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8" role="main" aria-label="Artist Dashboard">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Artist Dashboard</h1>
            <div className="flex items-center gap-2">
              {isVerifiedArtist ? (
                <Badge variant="outline" className="gap-1" role="status" aria-label="Verified Artist Status">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  Verified Artist
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1" role="status" aria-label="Emerging Artist Status">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  Emerging Artist
                </Badge>
              )}
              {profile.exhibition_badge && (
                <Badge variant="outline" className="gap-1" role="status" aria-label="Exhibition Badge Status">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  Exhibition Badge
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage your artworks and track your performance
          </p>
        </div>
        <Button asChild>
          <Link 
            href="/artist/artworks/new" 
            role="button"
            aria-label="Upload New Artwork"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            Upload New Artwork
          </Link>
        </Button>
      </div>

      {/* Verification Progress for Emerging Artists */}
      {isEmergingArtist && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Progress</CardTitle>
            <CardDescription>
              Complete these steps to become a verified artist and unlock additional features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground" aria-label={`${verificationProgress}% complete`}>
                  {verificationProgress}%
                </span>
              </div>
              <Progress 
                value={verificationProgress} 
                className="h-2"
                aria-label="Verification progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={verificationProgress}
              />
              {verificationStatus === 'ready_for_review' ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <AlertTitle>Ready for Review</AlertTitle>
                  <AlertDescription>
                    Your application is complete and ready for review. We'll notify you once it's been processed.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <Link 
                    href="/artist/verification"
                    role="button"
                    aria-label="Continue Verification Process"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                  >
                    Continue Verification
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stripe Setup - Only for Verified Artists */}
      {isVerifiedArtist && (
        <StripeOnboarding 
          stripeAccountId={profile.stripe_account_id || null} 
          onboardingComplete={!!profile.stripe_onboarding_complete} 
        />
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
                {isEmergingArtist && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Limit: 10 artworks for emerging artists
                  </p>
                )}
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
            <Button 
              asChild 
              className="w-full"
              disabled={isEmergingArtist && totalArtworks >= 10}
            >
              <Link 
                href="/artist/artworks/new"
                role="button"
                aria-label={isEmergingArtist && totalArtworks >= 10 ? "Upload limit reached for emerging artists" : "Upload New Artwork"}
                tabIndex={0}
                onKeyDown={handleKeyDown}
              >
                Upload New Artwork
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link 
                href="/artist/portfolio"
                role="button"
                aria-label="View Your Portfolio"
                tabIndex={0}
                onKeyDown={handleKeyDown}
              >
                View Portfolio
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link 
                href="/artist/artworks"
                role="button"
                aria-label="Manage Your Artworks"
                tabIndex={0}
                onKeyDown={handleKeyDown}
              >
                Manage Artworks
              </Link>
            </Button>
            {isEmergingArtist && (
              <Button asChild variant="outline" className="w-full">
                <Link 
                  href="/artist/verification"
                  role="button"
                  aria-label="Start Verification Journey"
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  Verification Journey
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* AI Artist Assistant - Available to all artists */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>AI Artist Assistant</CardTitle>
            <CardDescription>
              Get help with portfolio management, artwork descriptions, and professional development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            </div>
          </CardContent>
        </Card>

        {/* Verified-Only Features */}
        {isVerifiedArtist ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Gallery Integration</CardTitle>
                <CardDescription>
                  Connect with physical galleries and track visitor engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link 
                    href="/artist/gallery"
                    role="button"
                    aria-label="Manage Gallery Integration"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                  >
                    Manage Gallery
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enhanced Analytics</CardTitle>
                <CardDescription>
                  Track your performance and visitor engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link 
                    href="/artist/analytics"
                    role="button"
                    aria-label="View Enhanced Analytics"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                  >
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <FeatureComingSoon
              title="Gallery Integration"
              description="Connect with physical galleries, manage exhibitions, and track visitor engagement. Available for verified artists."
              verifiedOnly
            />
            <FeatureComingSoon
              title="Enhanced Analytics"
              description="Get detailed insights into your artwork performance and visitor engagement. Available for verified artists."
              verifiedOnly
            />
          </>
        )}

        {/* Messaging Center - Coming Soon for all */}
        <FeatureComingSoon
          title="Messaging Center"
          description="Communicate directly with collectors and manage inquiries."
          verifiedOnly={false}
        />
      </div>
    </div>
  );
} 