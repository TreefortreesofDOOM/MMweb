'use client'

import { FeedError } from '@/components/feed/error/feed-error'

export default function PatronFeedErrorBoundary({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patron Feed</h1>
          <p className="text-muted-foreground">
            Stay updated with artworks and activities from your followed artists
          </p>
        </div>
        <FeedError error={{ code: 'PATRON_FEED_ERROR', message: error.message }} reset={reset} />
      </div>
    </div>
  )
} 