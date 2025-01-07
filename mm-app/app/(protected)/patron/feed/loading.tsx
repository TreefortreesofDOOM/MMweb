import { FeedSkeleton } from '@/components/feed/ui/feed-skeleton'

export default function PatronFeedLoading() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded mt-2" />
        </div>
        <FeedSkeleton />
      </div>
    </div>
  )
} 