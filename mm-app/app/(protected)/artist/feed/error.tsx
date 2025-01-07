'use client'

import { FeedError } from '@/components/feed/error/feed-error'

export default function ArtistFeedErrorBoundary({
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
          <h1 className="text-3xl font-bold tracking-tight">Artist Feed</h1>
          <p className="text-muted-foreground">
            Stay connected with your art community and followers
          </p>
        </div>
        <FeedError error={{ code: 'ARTIST_FEED_ERROR', message: error.message }} reset={reset} />
      </div>
    </div>
  )
} 