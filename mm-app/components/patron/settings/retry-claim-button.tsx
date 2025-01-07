"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { retryClaimGhostProfileAction } from "@/lib/actions/patron-actions";

export function RetryClaimButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRetry = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const result = await retryClaimGhostProfileAction(user.id);
      toast({
        title: result.success ? "Success!" : "No purchases found",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error retrying claim:", error);
      toast({
        title: "Error",
        description: "Failed to check for previous purchases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Previous Purchases</h3>
          <p className="text-sm text-muted-foreground">
            Check for any unclaimed purchases made with your email address
          </p>
        </div>
        <Button
          onClick={handleRetry}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? "Checking..." : "Check for Purchases"}
        </Button>
      </div>
    </div>
  );
} 