'use client';

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { GhostProfile } from "@/lib/types/ghost-profiles";

interface GhostProfileBannerProps {
  ghostProfile: GhostProfile;
  onClaim?: () => Promise<void>;
}

export function GhostProfileBanner({ ghostProfile, onClaim }: GhostProfileBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!onClaim) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await onClaim();
      setMessage("Successfully claimed your ghost profile!");
    } catch (error) {
      console.error("Error claiming ghost profile:", error);
      setMessage("Failed to claim ghost profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Alert className="mb-4">
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p>
            We found a guest profile with {ghostProfile.totalPurchases} previous{" "}
            {ghostProfile.totalPurchases === 1 ? "purchase" : "purchases"} worth{" "}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(ghostProfile.totalSpent / 100)}
          </p>
          {message && (
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          )}
        </div>
        {onClaim && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClaim}
            disabled={isLoading}
          >
            {isLoading ? "Claiming..." : "Claim Profile"}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
} 