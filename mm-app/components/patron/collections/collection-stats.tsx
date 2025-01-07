'use client'

import { type FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, DollarSign, Clock, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/supabase-client'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
}

const StatCard: FC<StatCardProps> = ({ title, value, description, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
)

interface CollectionStatsProps {
  collectionId: string
}

export const CollectionStats: FC<CollectionStatsProps> = ({ collectionId }) => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['collection-stats', collectionId],
    queryFn: async () => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .rpc('get_collection_stats', { collection_id: collectionId })
        .single()

      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load collection stats: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (!stats) {
    return (
      <Alert>
        <AlertDescription>
          No stats available for this collection.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Value"
        value={`$${((stats.total_value || 0) / 100).toLocaleString()}`}
        description="Combined value of all artworks"
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Average Price"
        value={`$${((stats.average_price || 0) / 100).toLocaleString()}`}
        description="Average price per artwork"
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Unique Artists"
        value={stats.unique_artists || 0}
        description="Number of different artists"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Last Purchase"
        value={`${stats.days_since_last_purchase || 0} days ago`}
        description="Time since last transaction"
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
} 