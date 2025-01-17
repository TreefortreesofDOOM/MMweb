export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-4">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
          {/* Content */}
          <div className="space-y-4">
            <div className="aspect-[16/9] rounded-lg bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              <div className="h-3 w-96 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 