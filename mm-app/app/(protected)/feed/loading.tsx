import { FeedSkeleton } from '@/components/feed/ui/feed-skeleton'

export default function FeedLoading() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <FeedSkeleton />
      </div>
    </div>
  )
} 