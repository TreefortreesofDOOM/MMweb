'use client';

import { useVerification } from "@/hooks/use-verification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function RequirementsList() {
  const { verificationStatus } = useVerification();

  if (!verificationStatus) {
    return null;
  }

  const { requirements, progress } = verificationStatus;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Requirements</CardTitle>
        <CardDescription>Complete these requirements to become a verified artist</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {Object.entries(requirements).map(([key, requirement]) => (
            <div key={key} className="flex items-start gap-3">
              {requirement.complete ? (
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <div className="space-y-1">
                <h3 className={cn(
                  "font-medium",
                  requirement.complete ? "text-primary" : "text-muted-foreground"
                )}>
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h3>
                <p className="text-sm text-muted-foreground">{requirement.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 