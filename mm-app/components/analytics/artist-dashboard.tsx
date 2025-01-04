'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import type { AnalyticsData } from '@/lib/types/analytics.types'
import { getArtistAnalytics } from '@/lib/actions/analytics'
import { MetricsCard } from './ui/metrics-card'
import { AnalyticsChart } from './ui/analytics-chart'
import { EmptyState } from './ui/empty-state'
import { formatPrice } from '@/lib/utils/common-utils'

interface ArtistDashboardProps {
  artistId: string
}

export function ArtistDashboard({ artistId }: ArtistDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true)
        setError(null)

        const { data: analyticsData, error: analyticsError } = await getArtistAnalytics(artistId)

        if (analyticsError) {
          throw new Error(analyticsError)
        }

        if (analyticsData) {
          setData(analyticsData)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error instanceof Error ? error.message : error)
        setError('Failed to load analytics data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [artistId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return <EmptyState message={error || 'Failed to load analytics'} />
  }

  const totalArtworkViews = data.artworkViews.reduce((sum, a) => sum + a.views, 0)
  const totalFavorites = data.artworkViews.reduce((sum, a) => sum + (a.favoriteCount || 0), 0)

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="artworks">Artworks</TabsTrigger>
        <TabsTrigger value="gallery">Gallery</TabsTrigger>
        <TabsTrigger value="sales">Sales</TabsTrigger>
        <TabsTrigger value="engagement">Engagement</TabsTrigger>
        <TabsTrigger value="collectors">Collectors</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Profile Views"
            value={data.profileViews}
            subtitle="Last 30 days"
          />
          <MetricsCard
            title="Artwork Views"
            value={totalArtworkViews}
            subtitle="Last 30 days"
          />
          <MetricsCard
            title="Total Sales"
            value={formatPrice(data.totalSales)}
            subtitle="Last 30 days"
          />
          <MetricsCard
            title="Gallery Visits"
            value={data.galleryVisits}
            subtitle="Last 30 days"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {data.revenueOverTime.length > 0 ? (
            <AnalyticsChart
              title="Sales Over Time"
              data={data.revenueOverTime}
            />
          ) : (
            <EmptyState message="No sales data available" />
          )}

          {data.visitsByTime.length > 0 ? (
            <AnalyticsChart
              title="Gallery Visits"
              data={data.visitsByTime.map(visit => ({
                date: new Date(visit.hour).toISOString(),
                amount: visit.count
              }))}
            />
          ) : (
            <EmptyState message="No gallery visit data available" />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Top Artworks</h3>
            {data.artworkViews.length > 0 ? (
              <div className="space-y-4">
                {data.artworkViews
                  .sort((a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0))
                  .slice(0, 5)
                  .map((artwork) => (
                    <div key={artwork.artworkId} className="flex items-center justify-between">
                      <div className="truncate flex-1">
                        <p className="text-sm font-medium">{artwork.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {artwork.views} views
                        </p>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-muted-foreground">
                          {artwork.favoriteCount || 0} favorites
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyState message="No artwork data available" />
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            {data.userEngagement.length > 0 ? (
              <div className="space-y-4">
                {data.userEngagement.map((engagement, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="truncate flex-1">
                      <p className="text-sm font-medium">
                        {new Date(engagement.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-muted-foreground">
                        {engagement.sessions} sessions, {engagement.events} events
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No recent activity data available" />
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="artworks" className="space-y-4">
        <EmptyState message="Artwork analytics coming soon" />
      </TabsContent>

      <TabsContent value="gallery" className="space-y-4">
        <EmptyState message="Gallery analytics coming soon" />
      </TabsContent>

      <TabsContent value="sales" className="space-y-4">
        <EmptyState message="Sales analytics coming soon" />
      </TabsContent>

      <TabsContent value="engagement" className="space-y-4">
        <EmptyState message="Engagement analytics coming soon" />
      </TabsContent>

      <TabsContent value="collectors" className="space-y-4">
        <EmptyState message="Collector analytics coming soon" />
      </TabsContent>
    </Tabs>
  )
} 