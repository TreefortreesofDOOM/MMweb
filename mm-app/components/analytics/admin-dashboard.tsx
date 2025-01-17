'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Users, Palette, ShoppingBag, UserCheck2 } from 'lucide-react'
import type { AnalyticsData } from '@/lib/types/analytics-types'
import { getAdminAnalytics } from '@/lib/actions/analytics'
import { MetricsCard } from './ui/metrics-card'
import { AnalyticsChart } from './ui/analytics-chart'
import { EmptyState } from './ui/empty-state'

export function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true)
        setError(null)

        const { data: analyticsData, error: analyticsError } = await getAdminAnalytics()

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
  }, [])

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

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="engagement">Engagement</TabsTrigger>
        <TabsTrigger value="gallery">Gallery</TabsTrigger>
        <TabsTrigger value="financial">Financial</TabsTrigger>
        <TabsTrigger value="community">Community</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Total Users"
            value={data.totalUsers || 0}
            icon={Users}
          />
          <MetricsCard
            title="Total Artists"
            value={data.totalArtists || 0}
            icon={Palette}
          />
          <MetricsCard
            title="Total Artworks"
            value={data.totalArtworks || 0}
            icon={ShoppingBag}
          />
          <MetricsCard
            title="Pending Applications"
            value={data.pendingApplications || 0}
            icon={UserCheck2}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MetricsCard
            title="Page Views"
            value={data.pageViews}
            subtitle={`${data.uniqueVisitors} unique visitors`}
          />
          <MetricsCard
            title="Avg. Session Duration"
            value={`${data.averageSessionDuration.toFixed(1)} min`}
            subtitle={`${data.bounceRate.toFixed(1)}% bounce rate`}
          />
        </div>

        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Top Pages</h3>
          {data.topPages.length > 0 ? (
            <div className="space-y-4">
              {data.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="truncate flex-1">
                    <p className="text-sm font-medium">{page.path}</p>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">{page.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No page view data available" />
          )}
        </div>
      </TabsContent>

      <TabsContent value="engagement" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Profile Views"
            value={data.profileViews}
          />
          <MetricsCard
            title="Total Favorites"
            value={data.totalFavorites}
          />
          <MetricsCard
            title="New Followers"
            value={data.followersGained}
          />
          <MetricsCard
            title="Community Score"
            value={`${data.communityMetrics.engagementScore}%`}
          />
        </div>

        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Conversion Rates</h3>
          {data.conversionRates.map((conversion, index) => (
            <div key={index} className="flex items-center justify-between">
              <p className="text-sm font-medium">{conversion.type}</p>
              <p className="text-sm text-muted-foreground">{conversion.rate}%</p>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="gallery" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Gallery Visits"
            value={data.galleryVisits}
            subtitle={`${data.physicalVisits} physical, ${data.virtualVisits} virtual`}
          />
          <MetricsCard
            title="QR Scans"
            value={data.exhibitionMetrics.qrPerformance.scans}
            subtitle={`${data.exhibitionMetrics.qrPerformance.conversionRate.toFixed(1)}% conversion`}
          />
          <MetricsCard
            title="Physical Visits"
            value={data.physicalVisits}
          />
          <MetricsCard
            title="Virtual Visits"
            value={data.virtualVisits}
          />
        </div>
      </TabsContent>

      <TabsContent value="financial" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Total Sales"
            value={`$${data.totalSales.toLocaleString()}`}
          />
          <MetricsCard
            title="Average Order Value"
            value={`$${data.averageArtworkPrice.toLocaleString()}`}
          />
          <MetricsCard
            title="Transactions"
            value={data.revenueOverTime.length}
          />
          <MetricsCard
            title="Avg. Collector Value"
            value={`$${data.collectorMetrics.averageCollectorValue.toLocaleString()}`}
          />
        </div>

        <AnalyticsChart
          title="Revenue Over Time"
          data={data.revenueOverTime}
        />
      </TabsContent>

      <TabsContent value="community" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Comments"
            value={data.communityMetrics.platformActivity.comments}
          />
          <MetricsCard
            title="Shares"
            value={data.communityMetrics.platformActivity.shares}
          />
          <MetricsCard
            title="Total Favorites"
            value={data.totalFavorites}
          />
          <MetricsCard
            title="Engagement Score"
            value={`${data.communityMetrics.engagementScore}%`}
          />
        </div>

        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Portfolio Completion</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Average Completion Rate</p>
            <p className="text-sm text-muted-foreground">{data.portfolioMetrics.completionRate}%</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
} 