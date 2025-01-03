'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createBrowserClient } from '@/lib/supabase/supabase-client'
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
import type { Database } from '@/lib/types/database.types'
import { formatPrice } from '@/lib/utils/common-utils'
import { format } from 'date-fns'

type UserEvent = Database['public']['Tables']['user_events']['Row']
type UserSession = Database['public']['Tables']['user_sessions']['Row']
type RoleConversion = Database['public']['Tables']['role_conversions']['Row']
type Artwork = Database['public']['Tables']['artworks']['Row']

// Add ArtworkDetail type
type ArtworkDetail = Artwork & {
  artwork_favorites?: { count: number }[]
  artwork_comments?: { count: number }[]
  category?: string
  medium?: string
}

interface AnalyticsData {
  // Overview Metrics
  pageViews: number
  uniqueVisitors: number
  averageSessionDuration: number
  bounceRate: number
  
  // Artwork Performance
  artworkViews: {
    artworkId: string
    title: string
    views: number
    favoriteCount: number
    lastViewed: string
  }[]
  totalFavorites: number
  favoritesByDate: { date: string; count: number }[]
  topFavoritedArtworks: {
    artworkId: string
    title: string
    favorites: number
    viewToFavoriteRate: number
  }[]
  
  // Profile Performance
  profileViews: number
  followerCount: number
  followersGained: number
  
  // Engagement Metrics
  topPages: { path: string; views: number }[]
  userEngagement: { date: string; sessions: number; events: number }[]
  conversionRates: { type: string; rate: number }[]
  
  // Gallery Performance
  galleryScans: number
  galleryVisits: number
  physicalVisits: number
  virtualVisits: number
  visitsByTime: { hour: number; count: number }[]
  
  // Financial Metrics
  totalSales: number
  averageArtworkPrice: number
  revenueOverTime: { date: string; amount: number }[]
  salesByArtwork: { artworkId: string; title: string; sales: number; revenue: number }[]
  
  // Feature Usage
  featureUsage: { feature: string; count: number }[]
  mostUsedFeatures: { feature: string; count: number }[]
  
  // Visitor Demographics
  visitorLocations: { location: string; count: number }[]
  deviceTypes: { device: string; count: number }[]
  referralSources: { source: string; count: number }[]
  
  // Community Engagement Metrics
  communityMetrics: {
    engagementScore: number
    verificationImpact: number
    platformActivity: {
      comments: number
      shares: number
      responses: number
    }
  }
  
  // Portfolio Health Metrics
  portfolioMetrics: {
    completionRate: number
    categoryDistribution: { category: string; count: number }[]
    mediumPerformance: { medium: string; views: number; favorites: number }[]
    priceRangePerformance: { range: string; sales: number; revenue: number }[]
  }
  
  // Exhibition Analytics
  exhibitionMetrics: {
    badgeImpact: {
      beforeViews: number
      afterViews: number
      viewIncrease: number
    }
    qrPerformance: {
      scans: number
      conversions: number
      conversionRate: number
    }
  }
  
  // Collector Analytics
  collectorMetrics: {
    repeatCollectors: number
    averageCollectorValue: number
    geographicDistribution: { location: string; collectors: number }[]
    pricePreferences: { range: string; frequency: number }[]
  }
}

interface AnalyticsDashboardProps {
  artistId?: string
}

// Create a single instance of the Supabase client
const supabase = createBrowserClient()

// Add these types
type ArtworkWithFavorites = Database['public']['Tables']['artworks']['Row'] & {
  artwork_favorites: { count: number }[]
}

type GalleryVisit = Database['public']['Tables']['gallery_visits']['Row'] & {
  visit_type: 'physical' | 'virtual'
  metadata: {
    scan?: boolean
    [key: string]: any
  }
}

type Follow = Database['public']['Tables']['follows']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']
type FeatureUsage = Database['public']['Tables']['feature_usage']['Row']

// Add type for artwork favorites
type ArtworkFavorite = Database['public']['Tables']['artwork_favorites']['Row']

interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

// Add EmptyState component at the top
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-4xl mb-4">📊</div>
      <h3 className="text-lg font-medium mb-2">No data available</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function AnalyticsDashboard({ artistId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true)
        setError(null)

        // Base queries
        let pageViewsQuery = supabase
          .from('user_events')
          .select('*')
          .eq('event_type', 'page_view')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        let sessionsQuery = supabase
          .from('user_sessions')
          .select('*')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        let conversionsQuery = supabase
          .from('role_conversions')
          .select('*')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (artistId) {
          // Get artist's artworks with favorites count
          const { data: artworks } = await supabase
            .from('artworks')
            .select(`
              id,
              title,
              price,
              created_at,
              status,
              artwork_favorites (
                count
              )
            `)
            .eq('artist_id', artistId)

          // Get gallery visits
          const { data: galleryData } = await supabase
            .from('gallery_visits')
            .select('*')
            .eq('user_id', artistId)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

          // Get followers
          const { data: followers } = await supabase
            .from('follows')
            .select('created_at')
            .eq('following_id', artistId)

          // Get transactions
          const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('artist_id', artistId)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

          const artworkIds = (artworks as ArtworkWithFavorites[])?.map(a => a.id) || []
          
          // Update page views query to include profile and artwork views
          if (artworkIds.length > 0) {
            pageViewsQuery = pageViewsQuery
              .or(`event_data->>'url'.ilike.%/artist/${artistId}%,event_data->>'url'.ilike.%/artwork/${artworkIds[0]}%`)
          } else {
            pageViewsQuery = pageViewsQuery
              .or(`event_data->>'url'.ilike.%/artist/${artistId}%`)
          }

          sessionsQuery = sessionsQuery.eq('user_id', artistId)
          conversionsQuery = conversionsQuery.eq('user_id', artistId)

          // Execute main queries
          const [
            { data: pageViews, error: pageViewsError },
            { data: sessions, error: sessionsError },
            { data: conversions, error: conversionsError }
          ] = await Promise.all([
            pageViewsQuery,
            sessionsQuery,
            conversionsQuery
          ])

          if (pageViewsError) throw new Error(`Page views error: ${pageViewsError.message}`)
          if (sessionsError) throw new Error(`Sessions error: ${sessionsError.message}`)
          if (conversionsError) throw new Error(`Conversions error: ${conversionsError.message}`)

          // Process page views
          const pageViewsMap = (pageViews as UserEvent[])?.reduce((acc, pv: UserEvent) => {
            const eventData = pv.event_data as { url: string } | null
            const path = eventData?.url || 'unknown'
            acc[path] = (acc[path] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          // Calculate artwork-specific metrics
          const artworkViews = (artworks as ArtworkWithFavorites[])?.map(artwork => {
            const views = pageViewsMap[`/artwork/${artwork.id}`] || 0

            const lastViewedEvent = pageViews?.find((pv: UserEvent) => 
              (pv.event_data as { url: string } | null)?.url?.includes(`/artwork/${artwork.id}`)
            )

            return {
              artworkId: artwork.id,
              title: artwork.title,
              views,
              favoriteCount: artwork.artwork_favorites?.length || 0,
              lastViewed: lastViewedEvent?.created_at || artwork.created_at
            }
          }) || []

          // Calculate revenue over time
          const revenueByDate = (transactions as Transaction[])?.reduce((acc, t) => {
            const date = format(new Date(t.created_at || new Date()), 'yyyy-MM-dd')
            acc[date] = (acc[date] || 0) + (t.artist_amount || 0)
            return acc
          }, {} as Record<string, number>)

          const revenueOverTime = Object.entries(revenueByDate || {})
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

          // Calculate profile views
          const profileViews = Object.entries(pageViewsMap)
            .filter(([path]) => path.includes(`/artist/${artistId}`))
            .reduce((total, [, count]) => total + count, 0)

          // Calculate followers gained in last 30 days
          const followersGained = (followers as Follow[])?.filter(f => 
            new Date(f.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length || 0

          // Calculate conversion rates
          const conversionRates = [
            {
              type: 'Artwork Views to Sales',
              rate: artworkViews.length > 0 ? (transactions?.length || 0) / artworkViews.reduce((total, a) => total + a.views, 0) * 100 : 0
            },
            {
              type: 'Profile Views to Follows',
              rate: profileViews > 0 ? (followersGained || 0) / profileViews * 100 : 0
            }
          ]

          // Get feature usage
          const { data: featureUsage } = await supabase
            .from('feature_usage')
            .select('*')
            .eq('user_id', artistId)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

          // Process gallery visits by type
          const physicalVisits = (galleryData as GalleryVisit[])?.filter(v => v.visit_type === 'physical').length || 0
          const virtualVisits = (galleryData as GalleryVisit[])?.filter(v => v.visit_type === 'virtual').length || 0
          const galleryScans = (galleryData as GalleryVisit[])?.filter(v => v.metadata?.scan === true).length || 0

          // Calculate visits by hour
          const visitsByTime = (galleryData as GalleryVisit[])?.reduce((acc, visit) => {
            const hour = new Date(visit.created_at).getHours()
            acc[hour] = (acc[hour] || 0) + 1
            return acc
          }, {} as Record<number, number>)

          // Process visitor demographics from event_data
          const visitorData = (pageViews as UserEvent[])?.reduce((acc, pv) => {
            const data = pv.event_data as { location?: string; device?: string; referrer?: string } | null
            if (data?.location) acc.locations[data.location] = (acc.locations[data.location] || 0) + 1
            if (data?.device) acc.devices[data.device] = (acc.devices[data.device] || 0) + 1
            if (data?.referrer) acc.referrers[data.referrer] = (acc.referrers[data.referrer] || 0) + 1
            return acc
          }, { locations: {}, devices: {}, referrers: {} } as Record<string, Record<string, number>>)

          // Calculate sales by artwork
          const salesByArtwork = (artworks as ArtworkWithFavorites[])?.map(artwork => {
            const artworkSales = (transactions as Transaction[])?.filter(t => t.artwork_id === artwork.id) || []
            return {
              artworkId: artwork.id,
              title: artwork.title,
              sales: artworkSales.length,
              revenue: artworkSales.reduce((total, t) => total + (t.artist_amount || 0), 0)
            }
          })

          // Get artwork favorites with timestamps
          const { data: artworkFavorites } = await supabase
            .from('artwork_favorites')
            .select('*')
            .in('artwork_id', artworkIds)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

          // Calculate favorites by date
          const favoritesByDate = (artworkFavorites as ArtworkFavorite[] || []).reduce((acc: Record<string, number>, fav: ArtworkFavorite) => {
            const date = format(new Date(fav.created_at), 'yyyy-MM-dd')
            acc[date] = (acc[date] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          // Calculate top favorited artworks with view-to-favorite rate
          const topFavoritedArtworks = artworkViews
            .map(artwork => ({
              artworkId: artwork.artworkId,
              title: artwork.title,
              favorites: artwork.favoriteCount,
              viewToFavoriteRate: artwork.views > 0 ? (artwork.favoriteCount / artwork.views) * 100 : 0
            }))
            .sort((a, b) => b.favorites - a.favorites)
            .slice(0, 5)

          // Get artist's profile with engagement score
          const { data: profile } = await supabase
            .from('profiles')
            .select('community_engagement_score, verification_status, verification_status_updated_at, exhibition_badge')
            .eq('id', artistId)
            .single()

          // Get artwork categories and mediums
          const { data: artworkDetails } = await supabase
            .from('artworks')
            .select(`
              id,
              title,
              category,
              medium,
              price,
              status,
              artwork_favorites (
                id
              ),
              artwork_comments (
                id
              )
            `)
            .eq('artist_id', artistId)

          console.log('Fetched artworkDetails:', {
            total: artworkDetails?.length || 0,
            published: artworkDetails?.filter((art: ArtworkDetail) => art.status === 'published').length || 0,
            statuses: artworkDetails?.map((art: ArtworkDetail) => ({
              id: art.id,
              status: art.status,
              category: art.category,
              medium: art.medium
            })),
            raw: artworkDetails
          })

          // Calculate portfolio health metrics
          const publishedArtworks = (artworkDetails as ArtworkDetail[])?.filter(art => art.status === 'published') || []
          const totalArtworks = (artworkDetails as ArtworkDetail[])?.length || 0

          console.log('Portfolio Health Calculation:', {
            publishedArtworks: publishedArtworks.length,
            totalArtworks,
            artworkDetails: artworkDetails?.map((art: ArtworkDetail) => ({
              id: art.id,
              status: art.status,
              category: art.category,
              medium: art.medium
            }))
          })

          // Get collector data
          const { data: collectors } = await supabase
            .from('transactions')
            .select(`
              buyer_id,
              artist_amount,
              artwork_id,
              created_at,
              profiles!buyer_id (
                location
              )
            `)
            .eq('artist_id', artistId)

          // Process portfolio metrics
          type ArtworkDetail = ArtworkWithFavorites & {
            category?: string
            medium?: string
            artwork_comments?: { count: number }[]
          }

          const categories = (artworkDetails as ArtworkDetail[] || []).reduce((acc, artwork) => {
            if (artwork.category) {
              acc[artwork.category] = (acc[artwork.category] || 0) + 1
            }
            return acc
          }, {} as Record<string, number>)

          const mediums = (artworkDetails as ArtworkDetail[] || []).reduce((acc, artwork) => {
            if (artwork.medium) {
              acc[artwork.medium] = acc[artwork.medium] || { views: 0, favorites: 0 }
              acc[artwork.medium].favorites += artwork.artwork_favorites?.length || 0
              acc[artwork.medium].views += pageViewsMap[`/artwork/${artwork.id}`] || 0
            }
            return acc
          }, {} as Record<string, { views: number; favorites: number }>)

          // Process collector metrics
          const collectorStats = (collectors || []).reduce((acc: {
            buyers: Record<string, number>
            locations: Record<string, number>
            priceRanges: Record<string, number>
          }, transaction: Transaction & { buyer?: { location?: string } }) => {
            const buyerId = transaction.buyer_id || 'unknown'
            const location = transaction.buyer?.location || 'unknown'
            
            acc.buyers[buyerId] = (acc.buyers[buyerId] || 0) + 1
            acc.locations[location] = (acc.locations[location] || 0) + 1
            
            const priceRange = getPriceRange(transaction.artist_amount || 0)
            acc.priceRanges[priceRange] = (acc.priceRanges[priceRange] || 0) + 1
            
            return acc
          }, { buyers: {}, locations: {}, priceRanges: {} })

          // Calculate community metrics
          const communityMetrics = {
            engagementScore: profile?.community_engagement_score || 0,
            verificationImpact: profile?.verification_status === 'verified' ? 
              ((pageViews?.length || 0) - (profile?.community_engagement_score || 0)) / (profile?.community_engagement_score || 1) * 100 : 0,
            platformActivity: {
              comments: (artworkDetails as ArtworkDetail[])?.reduce((sum: number, art: ArtworkDetail) => 
                sum + (art.artwork_comments?.length || 0), 0) || 0,
              shares: (pageViews as UserEvent[])?.filter(pv => 
                (pv.event_data as { shared?: boolean })?.shared === true
              ).length || 0,
              responses: (artworkDetails as ArtworkDetail[])?.reduce((sum, art) => 
                sum + (art.artwork_comments?.length || 0), 0) || 0
            }
          }

          // Process geographic distribution
          const geographicDistribution = Object.entries(collectorStats.locations)
            .map(([location, collectors]) => ({ 
              location, 
              collectors: collectors as number 
            }))
            .sort((a, b) => b.collectors - a.collectors)

          // Process price preferences
          const pricePreferences = Object.entries(collectorStats.priceRanges)
            .map(([range, frequency]) => ({ 
              range, 
              frequency: frequency as number 
            }))
            .sort((a, b) => b.frequency - a.frequency)

          // Calculate exhibition impact if badge exists
          const badgeImpact = profile?.exhibition_badge ? {
            beforeViews: (pageViews as UserEvent[])?.filter(pv => 
              new Date(pv.created_at) < new Date(profile.verification_status_updated_at)
            ).length || 0,
            afterViews: (pageViews as UserEvent[])?.filter(pv => 
              new Date(pv.created_at) >= new Date(profile.verification_status_updated_at)
            ).length || 0,
            viewIncrease: 0
          } : null

          if (badgeImpact) {
            badgeImpact.viewIncrease = ((badgeImpact.afterViews - badgeImpact.beforeViews) / badgeImpact.beforeViews) * 100
          }

          setData({
            // Overview Metrics
            pageViews: pageViews?.length || 0,
            uniqueVisitors: new Set((sessions as UserSession[])?.map(s => s.user_id)).size,
            averageSessionDuration: (sessions as UserSession[])?.reduce((acc, s) => {
              if (s.ended_at) {
                return acc + (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime())
              }
              return acc
            }, 0) / (sessions?.length || 1) / 1000 / 60,
            bounceRate: ((sessions as UserSession[])?.filter(s => !s.ended_at).length || 0) / (sessions?.length || 1) * 100,

            // Artwork Performance
            artworkViews,
            totalFavorites: artworkViews.reduce((total, a) => total + a.favoriteCount, 0),
            favoritesByDate: Object.entries(favoritesByDate)
              .map(([date, count]: [string, number]) => ({ date, count }))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
            topFavoritedArtworks,

            // Profile Performance
            profileViews,
            followerCount: followers?.length || 0,
            followersGained,

            // Engagement Metrics
            topPages: Object.entries(pageViewsMap)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([path, views]) => ({ path, views })),
            userEngagement: Object.values(
              (sessions as UserSession[])?.reduce((acc, s) => {
                const date = format(new Date(s.created_at), 'yyyy-MM-dd')
                acc[date] = acc[date] || { date, sessions: 0, events: 0 }
                acc[date].sessions++
                return acc
              }, {} as Record<string, { date: string; sessions: number; events: number }>)
            ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
            conversionRates,

            // Gallery Performance
            galleryScans,
            galleryVisits: galleryData?.length || 0,
            physicalVisits,
            virtualVisits,
            visitsByTime: Object.entries(visitsByTime || {}).map(([hour, count]) => ({ 
              hour: parseInt(hour), 
              count 
            })).sort((a, b) => a.hour - b.hour),

            // Financial Metrics
            totalSales: (transactions as Transaction[])?.reduce((total, t) => total + (t.artist_amount || 0), 0) || 0,
            averageArtworkPrice: (artworks as ArtworkWithFavorites[])?.reduce((total, a) => total + (a.price || 0), 0) / (artworks?.length || 1),
            revenueOverTime,
            salesByArtwork: salesByArtwork || [],

            // Feature Usage
            featureUsage: (featureUsage as FeatureUsage[])?.map(f => ({
              feature: f.feature_name,
              count: f.usage_count || 0
            })) || [],
            mostUsedFeatures: (featureUsage as FeatureUsage[])?.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
              .slice(0, 5)
              .map(f => ({
                feature: f.feature_name,
                count: f.usage_count || 0
              })) || [],

            // Visitor Demographics
            visitorLocations: Object.entries(visitorData?.locations || {})
              .map(([location, count]) => ({ location, count }))
              .sort((a, b) => b.count - a.count),
            deviceTypes: Object.entries(visitorData?.devices || {})
              .map(([device, count]) => ({ device, count }))
              .sort((a, b) => b.count - a.count),
            referralSources: Object.entries(visitorData?.referrers || {})
              .map(([source, count]) => ({ source, count }))
              .sort((a, b) => b.count - a.count),

            // Community Engagement Metrics
            communityMetrics,

            // Portfolio Health Metrics
            portfolioMetrics: {
              completionRate: totalArtworks > 0 ? (publishedArtworks.length / totalArtworks) * 100 : 0,
              categoryDistribution: Object.entries(
                (artworkDetails as ArtworkDetail[])?.reduce((acc: Record<string, number>, art: ArtworkDetail) => {
                  if (art.category) {
                    acc[art.category] = (acc[art.category] || 0) + 1
                  }
                  return acc
                }, {}) || {}
              ).map(([category, count]) => ({
                category,
                count,
                percentage: totalArtworks > 0 ? (count / totalArtworks) * 100 : 0
              })) as CategoryDistribution[],
              mediumPerformance: Object.entries(mediums).map(([medium, stats]) => ({
                medium,
                views: stats.views,
                favorites: stats.favorites,
                engagement: stats.views > 0 ? (stats.favorites / stats.views) * 100 : 0
              })),
              priceRangePerformance: calculatePriceRangePerformance(artworkDetails || [], transactions || [])
            },

            // Exhibition Analytics
            exhibitionMetrics: {
              badgeImpact: badgeImpact || {
                beforeViews: 0,
                afterViews: 0,
                viewIncrease: 0
              },
              qrPerformance: {
                scans: galleryScans,
                conversions: (transactions as Transaction[])?.filter(t => 
                  (galleryData as GalleryVisit[])?.some(v => 
                    new Date(t.created_at || new Date()).getTime() - new Date(v.created_at || new Date()).getTime() < 24 * 60 * 60 * 1000
                  )
                ).length || 0,
                conversionRate: galleryScans > 0 ? 
                  ((transactions as Transaction[])?.length || 0) / galleryScans * 100 : 0
              }
            },

            // Collector Analytics
            collectorMetrics: {
              repeatCollectors: Object.values(collectorStats.buyers).filter((count: unknown) => (count as number) > 1).length,
              averageCollectorValue: (transactions as Transaction[])?.reduce((sum, t) => sum + (t.artist_amount || 0), 0) / 
                Object.keys(collectorStats.buyers).length || 0,
              geographicDistribution,
              pricePreferences
            }
          })
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
      <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="artworks">Artworks</TabsTrigger>
        <TabsTrigger value="engagement">Engagement</TabsTrigger>
        <TabsTrigger value="conversions">Conversions</TabsTrigger>
        <TabsTrigger value="community">Community</TabsTrigger>
        <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        <TabsTrigger value="exhibition">Exhibition</TabsTrigger>
        <TabsTrigger value="collectors">Collectors</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {/* Traffic Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.pageViews}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(data.totalSales)}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.communityMetrics.engagementScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                {data.communityMetrics.verificationImpact > 0 ? 
                  `+${data.communityMetrics.verificationImpact.toFixed(1)}% since verification` : 
                  'Not verified yet'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.portfolioMetrics.completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Artwork Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Views</span>
                  <span className="text-sm font-medium">
                    {data.artworkViews.reduce((sum, a) => sum + a.views, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Favorites</span>
                  <span className="text-sm font-medium">{data.totalFavorites}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Comments</span>
                  <span className="text-sm font-medium">{data.communityMetrics.platformActivity.comments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Shares</span>
                  <span className="text-sm font-medium">{data.communityMetrics.platformActivity.shares}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exhibition Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">QR Scans</span>
                  <span className="text-sm font-medium">{data.exhibitionMetrics.qrPerformance.scans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="text-sm font-medium">
                    {data.exhibitionMetrics.qrPerformance.conversionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collector Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Repeat Collectors</span>
                  <span className="text-sm font-medium">{data.collectorMetrics.repeatCollectors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Value</span>
                  <span className="text-sm font-medium">
                    {formatPrice(data.collectorMetrics.averageCollectorValue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Lists */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatPrice(value as number)} />
                  <Line type="monotone" dataKey="amount" stroke="#2563eb" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle>Top Artworks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.artworkViews
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 3)
                  .map(artwork => (
                    <div key={artwork.artworkId} className="flex justify-between">
                      <span className="text-muted-foreground">{artwork.title}</span>
                      <span className="font-medium">{artwork.views} views</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.userEngagement
                  .slice(-3)
                  .reverse()
                  .map(day => (
                    <div key={day.date} className="flex justify-between">
                      <span className="text-muted-foreground">{day.date}</span>
                      <span className="font-medium">{day.events} interactions</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="artworks" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Artwork Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.artworkViews.length ? (
              <EmptyState message="Start adding artworks to see performance metrics" />
            ) : (
              <div className="space-y-8">
                {/* Favorites Over Time Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Favorites Over Time</h4>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.favoritesByDate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#2563eb" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Most Viewed Artworks */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Most Viewed Artworks</h4>
                  <div className="space-y-4">
                    {data.artworkViews
                      .sort((a, b) => b.views - a.views)
                      .slice(0, 5)
                      .map(artwork => (
                        <div key={artwork.artworkId} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{artwork.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Last viewed: {new Date(artwork.lastViewed).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-sm tabular-nums">
                            {artwork.views.toLocaleString()} views
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Most Favorited Artworks */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Most Favorited Artworks</h4>
                  <div className="space-y-4">
                    {data.topFavoritedArtworks.map(artwork => (
                      <div key={artwork.artworkId} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{artwork.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {artwork.viewToFavoriteRate.toFixed(1)}% favorite rate
                          </p>
                        </div>
                        <div className="text-sm tabular-nums">
                          {artwork.favorites.toLocaleString()} favorites
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Selling Artworks */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Best Selling Artworks</h4>
                  <div className="space-y-4">
                    {data.salesByArtwork
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5)
                      .map(artwork => (
                        <div key={artwork.artworkId} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{artwork.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {artwork.sales} {artwork.sales === 1 ? 'sale' : 'sales'}
                            </p>
                          </div>
                          <div className="text-sm tabular-nums">
                            {formatPrice(artwork.revenue)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="engagement" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.userEngagement.length ? (
              <EmptyState message="Start getting visitors to see engagement metrics" />
            ) : (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Total Profile Views</div>
                    <div className="text-2xl font-bold">{data.profileViews}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Followers Gained</div>
                    <div className="text-2xl font-bold">{data.followersGained}</div>
                    <div className="text-xs text-muted-foreground">Last 30 days</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Total Followers</div>
                    <div className="text-2xl font-bold">{data.followerCount}</div>
                  </div>
                </div>

                {/* Engagement Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Daily Activity</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.userEngagement}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="sessions" 
                          stroke="#8884d8" 
                          name="Sessions"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="events" 
                          stroke="#82ca9d" 
                          name="Interactions"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    Sessions show unique visits, while interactions include all user actions (views, likes, comments)
                  </div>
                </div>

                {/* Most Active Times */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Most Active Pages</h4>
                  <div className="space-y-2">
                    {data.topPages.map(page => (
                      <div key={page.path} className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="text-sm">{page.path}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((page.views / data.pageViews) * 100)}% of total views
                          </div>
                        </div>
                        <div className="text-sm font-medium">{page.views} views</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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

      <TabsContent value="community" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Community Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.communityMetrics.engagementScore && !data.communityMetrics.platformActivity.comments ? (
              <EmptyState message="Engage with the community to see metrics" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Engagement Score</div>
                  <div className="text-2xl font-bold">
                    {data.communityMetrics.engagementScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {data.communityMetrics.verificationImpact > 0 ? 
                      `+${data.communityMetrics.verificationImpact.toFixed(1)}% since verification` :
                      'Not verified yet'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium mb-2">Platform Activity</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Comments</span>
                      <span>{data.communityMetrics.platformActivity.comments}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shares</span>
                      <span>{data.communityMetrics.platformActivity.shares}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Responses</span>
                      <span>{data.communityMetrics.platformActivity.responses}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="portfolio" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Health</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.portfolioMetrics.categoryDistribution.length ? (
              <EmptyState message="Add artworks to your portfolio to see health metrics" />
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Portfolio Completion</span>
                    <span className="text-sm">{data.portfolioMetrics.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${data.portfolioMetrics.completionRate}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Category Distribution</div>
                  <div className="space-y-2">
                    {data.portfolioMetrics.categoryDistribution.map(cat => (
                      <div key={cat.category} className="flex justify-between text-sm">
                        <span>{cat.category}</span>
                        <span>{cat.count} artworks</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Medium Performance</div>
                  <div className="space-y-2">
                    {data.portfolioMetrics.mediumPerformance.map(medium => (
                      <div key={medium.medium} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{medium.medium}</span>
                          <span>{medium.views} views</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {medium.favorites} favorites
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="exhibition" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Exhibition Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.exhibitionMetrics.qrPerformance.scans && !data.exhibitionMetrics.badgeImpact.viewIncrease ? (
              <EmptyState message="Set up an exhibition or earn a badge to see analytics" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium mb-2">Badge Impact</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Before Badge</span>
                      <span>{data.exhibitionMetrics.badgeImpact.beforeViews} views</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>After Badge</span>
                      <span>{data.exhibitionMetrics.badgeImpact.afterViews} views</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>View Increase</span>
                      <span>{data.exhibitionMetrics.badgeImpact.viewIncrease.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">QR Performance</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Scans</span>
                      <span>{data.exhibitionMetrics.qrPerformance.scans}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Conversions</span>
                      <span>{data.exhibitionMetrics.qrPerformance.conversions}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Conversion Rate</span>
                      <span>{data.exhibitionMetrics.qrPerformance.conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="text-sm font-medium mb-4">Gallery Visits by Time</div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.visitsByTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="collectors" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Collector Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.collectorMetrics.repeatCollectors && !data.collectorMetrics.geographicDistribution.length ? (
              <EmptyState message="Make your first sale to see collector analytics" />
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium">Repeat Collectors</div>
                    <div className="text-2xl font-bold">{data.collectorMetrics.repeatCollectors}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Average Value</div>
                    <div className="text-2xl font-bold">{formatPrice(data.collectorMetrics.averageCollectorValue)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Geographic Distribution</div>
                  <div className="space-y-2">
                    {data.collectorMetrics.geographicDistribution.map(loc => (
                      <div key={loc.location} className="flex justify-between text-sm">
                        <span>{loc.location}</span>
                        <span>{loc.collectors} collectors</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Price Preferences</div>
                  <div className="space-y-2">
                    {data.collectorMetrics.pricePreferences.map(pref => (
                      <div key={pref.range} className="flex justify-between text-sm">
                        <span>{pref.range}</span>
                        <span>{pref.frequency} sales</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// Helper function to determine price range
function getPriceRange(amount: number): string {
  if (amount <= 100) return '0-100'
  if (amount <= 500) return '101-500'
  if (amount <= 1000) return '501-1000'
  if (amount <= 5000) return '1001-5000'
  return '5000+'
}

// Helper function to calculate price range performance
function calculatePriceRangePerformance(
  artworks: ArtworkDetail[], 
  transactions: Transaction[]
): { range: string; sales: number; revenue: number }[] {
  const ranges = {} as Record<string, { sales: number; revenue: number }>
  
  transactions.forEach(t => {
    const range = getPriceRange(t.artist_amount || 0)
    ranges[range] = ranges[range] || { sales: 0, revenue: 0 }
    ranges[range].sales++
    ranges[range].revenue += t.artist_amount || 0
  })

  return Object.entries(ranges)
    .map(([range, stats]) => ({ range, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
} 