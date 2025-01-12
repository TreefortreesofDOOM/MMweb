'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ArtworkProductList, ArtworkProductListSkeleton } from "./artwork-product-list";
import { useRouter } from "next/navigation";
import { useState } from "react";

type StoreManagementClientProps = {
  storeSettings: {
    stripe_account_id: string | null;
    stripe_onboarding_complete: boolean;
    application_fee_percent: number;
  } | null;
  artworks: Array<{
    id: string;
    title: string;
    images: {
      url: string;
      width?: number;
      height?: number;
    }[];
    store_products: Array<{
      id: string;
      status: string;
    }> | null;
  }>;
};

export function StoreManagementClient({ storeSettings, artworks }: StoreManagementClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Stripe is fully set up
  const isStripeSetup = storeSettings?.stripe_account_id && storeSettings?.stripe_onboarding_complete;

  const handleStripeConnect = async () => {
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

  const handleStripeDashboardView = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error accessing Stripe dashboard:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToStore = async (artworkId: string) => {
    router.push(`/artist/store/products/new?artwork=${artworkId}`);
  };

  const handleEditProduct = async (artworkId: string, productId: string) => {
    router.push(`/artist/store/products/${productId}/edit?artwork=${artworkId}`);
  };

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Store Management</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isStripeSetup && (
        <Alert role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Connect Stripe Account</AlertTitle>
          <AlertDescription>
            {storeSettings?.stripe_account_id && !storeSettings?.stripe_onboarding_complete
              ? "Please complete your Stripe account setup to start receiving payments."
              : "You need to connect your Stripe account to start selling your artworks. This allows you to receive payments directly to your bank account."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Settings</CardTitle>
            <CardDescription>
              Configure your store settings and payment preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Platform Fee</p>
                <p className="text-sm text-muted-foreground">
                  {storeSettings?.application_fee_percent ?? 50}% of each sale goes to the platform
                </p>
              </div>
              <div>
                <p className="font-medium">Stripe Account Status</p>
                <p className="text-sm text-muted-foreground">
                  {isStripeSetup
                    ? "Connected and verified"
                    : storeSettings?.stripe_account_id
                    ? "Setup incomplete"
                    : "Not connected"}
                </p>
              </div>
              {isStripeSetup ? (
                <Button 
                  variant="outline"
                  onClick={handleStripeDashboardView}
                  disabled={loading}
                  aria-label="View your Stripe dashboard"
                >
                  {loading ? "Loading..." : "View Stripe Dashboard"}
                </Button>
              ) : (
                <Button 
                  onClick={handleStripeConnect}
                  disabled={loading}
                  aria-label="Connect your Stripe account"
                >
                  {loading ? "Loading..." : storeSettings?.stripe_account_id ? "Complete Setup" : "Connect Stripe Account"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Artworks</CardTitle>
            <CardDescription>
              Manage your artworks in the store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ArtworkProductList
              artworks={artworks}
              onAddToStore={handleAddToStore}
              onEditProduct={handleEditProduct}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 