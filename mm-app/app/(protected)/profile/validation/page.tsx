'use client'

import { ValidationTracker } from "@/components/validation/validation-tracker"
import { useVerification } from "@/hooks/use-verification"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ValidationPage() {
  const { verificationStatus } = useVerification()

  if (!verificationStatus) {
    return <ValidationSkeleton />
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Verification Status</h1>
      <ValidationTracker 
        requirements={verificationStatus.requirements}
        progress={verificationStatus.progress}
        isVerified={verificationStatus.isVerified}
      />
    </div>
  )
}

function ValidationSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
} 