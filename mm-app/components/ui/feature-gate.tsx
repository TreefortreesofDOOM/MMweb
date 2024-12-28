'use client'

import { type ReactNode } from 'react'
import { useArtist } from '@/components/providers/artist-provider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { LockIcon } from 'lucide-react'
import type { ArtistFeatures } from '@/lib/types/custom-types'
import { ErrorBoundary } from 'react-error-boundary'

interface FeatureGateProps {
  children: ReactNode
  feature: keyof Omit<ArtistFeatures, 'stripeRequirements'>
  fallback?: ReactNode
}

const FeatureGateContent = ({ children, feature, fallback }: FeatureGateProps) => {
  const { features, isVerifiedArtist } = useArtist()

  if (!features) {
    return null
  }

  if (features[feature]) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Alert role="alert" aria-live="polite">
      <LockIcon className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>Verified Artists Only</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">This feature is available exclusively to verified artists.</p>
        {!isVerifiedArtist && (
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            aria-label="Start artist verification process"
          >
            <a 
              href="/artist/verification"
              tabIndex={0}
              role="link"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  window.location.href = '/artist/verification'
                }
              }}
            >
              Start Verification
            </a>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

export const FeatureGate = (props: FeatureGateProps) => {
  return (
    <ErrorBoundary
      fallback={
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to check feature access. Please try again later.
          </AlertDescription>
        </Alert>
      }
    >
      <FeatureGateContent {...props} />
    </ErrorBoundary>
  )
} 