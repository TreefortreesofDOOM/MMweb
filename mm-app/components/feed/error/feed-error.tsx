import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import type { FeedError } from '@/lib/types/feed-types'

export interface FeedErrorProps {
  error: FeedError
  reset: () => void
}

export function FeedError({ error, reset }: FeedErrorProps) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Feed</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
      <Button onClick={reset} variant="outline" className="w-full sm:w-auto">
        Try Again
      </Button>
    </div>
  )
} 