'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createBrowserClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  averageSessionDuration: number
  bounceRate: number
  topPages: { path: string; views: number }[]
  userEngagement: { date: string; sessions: number; events: number }[]
  conversionRates: { type: string; rate: number }[]
}

interface PageView {
  event_data: { url: string }
  artist_id?: string
}

interface Session {
  user_id: string
  started_at: string
  ended_at: string | null
  created_at: string
  artist_id?: string
}

interface RoleConversion {
  to_role: string
  artist_id?: string
}

interface AnalyticsDashboardProps {
  artistId?: string
}

// Create a single instance of the Supabase client
const supabase = createBrowserClient()

export function AnalyticsDashboard({ artistId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true)
        setError(null)

        // Base query for page views
        let pageViewsQuery = supabase
          .from('user_events')
          .select('*')
          .eq('event_type', 'page_view')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        // Base query for sessions
        let sessionsQuery = supabase
          .from('user_sessions')
          .select('*')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        // Base query for conversions
        let conversionsQuery = supabase
          .from('role_conversions')
          .select('*')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        // If artistId is provided, filter the queries
        if (artistId) {
          pageViewsQuery = pageViewsQuery.eq('artist_id', artistId)
          sessionsQuery = sessionsQuery.eq('artist_id', artistId)
          conversionsQuery = conversionsQuery.eq('artist_id', artistId)
        }

        // Execute queries
        const [
          { data: pageViews, error: pageViewsError },
          { data: sessions, error: sessionsError },
          { data: conversions, error: conversionsError }
        ] = await Promise.all([
          pageViewsQuery,
          sessionsQuery,
          conversionsQuery
        ])

        if (pageViewsError) throw pageViewsError
        if (sessionsError) throw sessionsError
        if (conversionsError) throw conversionsError

        // Calculate metrics
        const uniqueVisitors = new Set((sessions as Session[])?.map(s => s.user_id)).size
        const totalSessions = sessions?.length || 0
        const averageSessionDuration = (sessions as Session[])?.reduce((acc, s) => {
          if (s.ended_at) {
            return acc + (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime())
          }
          return acc
        }, 0) / totalSessions / 1000 / 60 // Convert to minutes

        // Get top pages
        const pageViewsMap = (pageViews as PageView[])?.reduce((acc, pv) => {
          const path = pv.event_data?.url || 'unknown'
          acc[path] = (acc[path] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const topPages = Object.entries(pageViewsMap || {})
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([path, views]) => ({ path, views }))

        // Calculate user engagement over time
        const engagement = (sessions as Session[])?.reduce((acc, s) => {
          const date = new Date(s.created_at).toLocaleDateString()
          acc[date] = acc[date] || { date, sessions: 0, events: 0 }
          acc[date].sessions++
          return acc
        }, {} as Record<string, { date: string; sessions: number; events: number }>)

        const userEngagement = Object.values(engagement || {}).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )

        // Calculate conversion rates
        const conversionRates = [
          {
            type: 'Artist Applications',
            rate: ((conversions as RoleConversion[])?.filter(c => c.to_role === 'emerging_artist').length || 0) / uniqueVisitors * 100
          },
          {
            type: 'Verified Artists',
            rate: ((conversions as RoleConversion[])?.filter(c => c.to_role === 'verified_artist').length || 0) / uniqueVisitors * 100
          }
        ]

        setData({
          pageViews: pageViews?.length || 0,
          uniqueVisitors,
          averageSessionDuration,
          bounceRate: ((sessions as Session[])?.filter(s => !s.ended_at).length || 0) / totalSessions * 100,
          topPages,
          userEngagement,
          conversionRates
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setError('Failed to load analytics data')
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error || 'Failed to load analytics'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="engagement">Engagement</TabsTrigger>
        <TabsTrigger value="conversions">Conversions</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.pageViews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.uniqueVisitors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.averageSessionDuration.toFixed(1)} min
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.bounceRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topPages.map(page => (
                <div key={page.path} className="flex justify-between">
                  <span className="text-muted-foreground">{page.path}</span>
                  <span className="font-medium">{page.views}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="engagement" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#8884d8" name="Sessions" />
                <Line type="monotone" dataKey="events" stroke="#82ca9d" name="Events" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="conversions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.conversionRates.map(rate => (
                <div key={rate.type} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{rate.type}</span>
                    <span className="font-medium">{rate.rate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${rate.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 