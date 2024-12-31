"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/actions/verification";
import { useState } from "react";

export function VerificationBanner() {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage(null);

    try {
      const result = await resendVerificationEmail();

      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage("Verification email sent! Please check your inbox.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="mb-4">
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          Please verify your email address to access all features.
          {message && (
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendVerification}
          disabled={isResending}
        >
          {isResending ? "Sending..." : "Resend Email"}
        </Button>
      </AlertDescription>
    </Alert>
  );
} 