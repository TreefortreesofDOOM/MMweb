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
import { CheckCircle2, AlertCircle, Eye, Heart, Image, BookOpen, FileText, CreditCard } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AIArtistAssistant } from '@/components/artist/ai-artist-assistant';
import { getArtworkStats } from '@/lib/actions/artwork';

interface DashboardClientProps {
  artworks: Array<{
    id: string;
    status: string;
  }>;
  profile: {
    id: string;
    stripe_account_id?: string | null;
    stripe_onboarding_complete?: boolean;
    role?: string;
    exhibition_badge?: boolean | null;
  };
}

export default function DashboardClient({ artworks, profile }: DashboardClientProps) {
  const { isVerifiedArtist, isEmergingArtist, getVerificationStatus, getVerificationPercentage } = useArtist();
  const verificationProgress = getVerificationPercentage();
  const verificationStatus = getVerificationStatus();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalArtworks: number;
    publishedArtworks: number;
    totalViews: number;
    totalFavorites: number;
  }>({
    totalArtworks: artworks.length,
    publishedArtworks: artworks.filter(a => a.status === 'published').length,
    totalViews: 0,
    totalFavorites: 0
  });

  useEffect(() => {
    async function fetchStats() {
      if (!profile?.id) {
        console.warn('Profile ID not available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { stats: artworkStats, error } = await getArtworkStats(profile.id);
        if (error) {
          console.error('Error fetching artwork stats:', error);
          return;
        }
        if (artworkStats) {
          setStats(artworkStats);
        }
      } catch (err) {
        console.error('Error in fetchStats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [profile?.id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (e.target as HTMLElement).click();
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8" role="main" aria-label="Artist Dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Artist Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {isVerifiedArtist && (
              <Badge variant="outline" className="gap-1" role="status" aria-label="Verified Artist Status">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Verified Artist
              </Badge>
            )}
            {isEmergingArtist && (
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
      </div>

      {/* Verification Progress - Only for Emerging Artists */}
      {isEmergingArtist && (
        <Card className="sm:hover:shadow-lg transition-shadow">
          <CardHeader className="sm:p-6">
            <CardTitle>Verification Progress</CardTitle>
            <CardDescription>Complete these steps to become a verified artist</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:p-6">
            <div className="space-y-2">
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

      {/* Stripe Setup - Only for Verified Artists who haven't completed onboarding */}
      {isVerifiedArtist && (!profile.stripe_account_id || !profile.stripe_onboarding_complete) && (
        <StripeOnboarding 
          stripeAccountId={profile.stripe_account_id || null} 
          onboardingComplete={!!profile.stripe_onboarding_complete} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Quick Stats */}
        <Card className="sm:hover:shadow-lg transition-shadow">
          <CardHeader className="sm:p-6">
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="sm:p-6">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="text-sm text-muted-foreground">Total Artworks</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {isLoading ? '-' : stats.totalArtworks}
                </p>
                {isEmergingArtist && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Limit: 10 artworks for emerging artists
                  </p>
                )}
              </div>
              <div className="p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {isLoading ? '-' : stats.publishedArtworks}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Total Views
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {isLoading ? '-' : stats.totalViews}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  Total Favorites
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {isLoading ? '-' : stats.totalFavorites}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="sm:hover:shadow-lg transition-shadow">
          <CardHeader className="sm:p-6">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 sm:p-6">
            <Button 
              asChild 
              className="w-full justify-start text-left font-medium hover:bg-primary/90 h-11"
              disabled={isEmergingArtist && stats.totalArtworks >= 10}
            >
              <Link 
                href="/artist/artworks/new"
                role="button"
                aria-label={isEmergingArtist && stats.totalArtworks >= 10 ? "Upload limit reached for emerging artists" : "Upload New Artwork"}
                className="flex items-center gap-2 px-4"
              >
                <Image className="h-4 w-4" aria-hidden="true" />
                Upload New Artwork
              </Link>
            </Button>
            <Button 
              asChild 
              variant="secondary" 
              className="w-full justify-start text-left font-medium hover:bg-secondary/90 h-11"
            >
              <Link 
                href="/artist/portfolio"
                role="button"
                aria-label="View Your Portfolio"
                className="flex items-center gap-2 px-4"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                View Portfolio
              </Link>
            </Button>
            <Button 
              asChild 
              variant="secondary" 
              className="w-full justify-start text-left font-medium hover:bg-secondary/90 h-11"
            >
              <Link 
                href="/artist/artworks"
                role="button"
                aria-label="Manage Your Artworks"
                className="flex items-center gap-2 px-4"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Manage Artworks
              </Link>
            </Button>
            {isEmergingArtist && (
              <Button 
                asChild 
                variant="secondary" 
                className="w-full justify-start text-left font-medium hover:bg-secondary/90 h-11"
              >
                <Link 
                  href="/artist/verification"
                  role="button"
                  aria-label="Start Verification Journey"
                  className="flex items-center gap-2 px-4"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Verification Journey
                </Link>
              </Button>
            )}
            {isVerifiedArtist && profile.stripe_account_id && profile.stripe_onboarding_complete && (
              <Button 
                asChild 
                className="w-full justify-start text-left font-medium h-11 bg-gradient-to-r from-emerald-400/90 to-emerald-600/90 hover:from-emerald-400 hover:to-emerald-600 text-white"
              >
                <Link 
                  href={`https://dashboard.stripe.com/${profile.stripe_account_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="button"
                  aria-label="View Stripe Dashboard"
                  className="flex items-center gap-2 px-4"
                >
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                  View Stripe Dashboard
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* AI Artist Assistant - Available to all artists */}
        <AIArtistAssistant className="col-span-1 md:col-span-2 sm:hover:shadow-lg transition-shadow" />

        {/* Verified-Only Features */}
        {isVerifiedArtist ? (
          <>
            <FeatureComingSoon
              title="Gallery Integration"
              description="Connect with physical galleries and track visitor engagement"
              restrictedTo="verified_artist"
            />
          </>
        ) : (
          <>
            <FeatureComingSoon
              title="Gallery Integration"
              description="Connect with physical galleries, manage exhibitions, and track visitor engagement. Available for verified artists."
              restrictedTo="verified_artist"
            />
          </>
        )}

        {/* Messaging Center - Coming Soon for all */}
        <FeatureComingSoon
          title="Messaging Center"
          description="Communicate directly with collectors and manage inquiries."
        />
      </div>
    </div>
  );
} 