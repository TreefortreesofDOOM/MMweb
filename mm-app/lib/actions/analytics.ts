'use server'

import { createActionClient } from '@/lib/supabase/supabase-action-utils'
import type { AnalyticsData } from '@/lib/types/analytics.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { UserRole } from '../types/custom-types'

interface DateRange {
  startDate: string
  endDate: string
}

interface SaleData {
  amount_total: number
  created_at: string
  artwork_id: string
  artworks: {
    title: string
  }[] | null
}

interface SessionData {
  user_id: string
  started_at: string
  ended_at?: string
}

interface EventData {
  event_type: string
  event_data?: {
    url?: string
  }
}

interface GalleryVisitData {
  visit_type: 'physical' | 'virtual'
}

// Utility functions
function getDefaultDateRange(): DateRange {
  const endDate = new Date().toISOString()
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  return { startDate, endDate }
}

function processRevenueData(sales: SaleData[]) {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount_total, 0)
  const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0

  const salesByDay = sales.reduce((acc, sale) => {
    const date = new Date(sale.created_at).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + sale.amount_total
    return acc
  }, {} as Record<string, number>)

  return {
    totalRevenue,
    averageOrderValue,
    revenueOverTime: Object.entries(salesByDay)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }
}

function processSessionData(sessions: SessionData[]) {
  const uniqueVisitors = new Set(sessions?.map(s => s.user_id)).size
  const totalSessions = sessions?.length || 0
  const averageSessionDuration = sessions?.reduce((acc, s) => {
    if (s.ended_at) {
      return acc + (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime())
    }
    return acc
  }, 0) / (totalSessions || 1) / 1000 / 60 // Convert to minutes

  const bounceRate = ((sessions?.filter(s => !s.ended_at).length || 0) / totalSessions * 100)

  return {
    uniqueVisitors,
    totalSessions,
    averageSessionDuration: parseFloat(averageSessionDuration.toFixed(1)),
    bounceRate: parseFloat(bounceRate.toFixed(1))
  }
}

function processSocialMetrics(events: EventData[]) {
  const shares = events?.filter(e => e.event_type === 'share').length || 0
  const likes = events?.filter(e => e.event_type === 'like').length || 0
  const comments = events?.filter(e => e.event_type === 'comment').length || 0
  const follows = events?.filter(e => e.event_type === 'follow').length || 0

  return { shares, likes, comments, follows }
}

function processPageViews(pageViews: EventData[]) {
  const pageViewsMap = (pageViews || []).reduce<Record<string, number>>((acc, pv) => {
    const path = pv.event_data?.url || 'unknown'
    acc[path] = (acc[path] || 0) + 1
    return acc
  }, {})

  return Object.entries(pageViewsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([path, views]) => ({ path, views }))
}

// Core analytics fetchers
async function fetchPlatformMetrics(supabase: SupabaseClient, dateRange: DateRange) {
  const [
    { count: totalUsers },
    { count: totalArtists },
    { count: totalArtworks },
    { count: pendingArtists }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['verified_artist', 'emerging_artist']),
    supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'emerging_artist')
      .eq('application_status', 'pending')
  ])

  return {
    totalUsers: totalUsers || 0,
    totalArtists: totalArtists || 0,
    totalArtworks: totalArtworks || 0,
    pendingArtists: pendingArtists || 0
  }
}

async function fetchEngagementMetrics(supabase: SupabaseClient, dateRange: DateRange, userId?: string) {
  const { startDate, endDate } = dateRange

  const [
    { data: pageViews },
    { data: sessions },
    { data: galleryVisits },
    { data: socialEvents }
  ] = await Promise.all([
    supabase
      .from('user_events')
      .select('*')
      .eq('event_type', 'page_view')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(userId ? { user_id: userId } : {}),
    supabase
      .from('user_sessions')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(userId ? { user_id: userId } : {}),
    supabase
      .from('gallery_visits')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(userId ? { user_id: userId } : {}),
    supabase
      .from('user_events')
      .select('*')
      .in('event_type', ['share', 'like', 'comment', 'follow'])
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .match(userId ? { user_id: userId } : {})
  ])

  const sessionMetrics = processSessionData(sessions as SessionData[] || [])
  const socialMetrics = processSocialMetrics(socialEvents as EventData[] || [])
  const topPages = processPageViews(pageViews as EventData[] || [])

  return {
    pageViews: pageViews?.length || 0,
    ...sessionMetrics,
    ...socialMetrics,
    topPages,
    galleryVisits: galleryVisits?.length || 0,
    physicalVisits: (galleryVisits as GalleryVisitData[] || []).filter(v => v.visit_type === 'physical').length || 0,
    virtualVisits: (galleryVisits as GalleryVisitData[] || []).filter(v => v.visit_type === 'virtual').length || 0
  }
}

async function fetchFinancialMetrics(supabase: SupabaseClient, dateRange: DateRange, artistId?: string) {
  const { startDate, endDate } = dateRange

  const { data: salesData } = await supabase
    .from('transactions')
    .select('amount_total, created_at, artwork_id, artworks(title)')
    .eq('status', 'completed')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .match(artistId ? { artist_id: artistId } : {})

  return processRevenueData(salesData as SaleData[] || [])
}

// Event tracking functions
async function getOrCreateSession(userId: string): Promise<string> {
  const supabase = await createActionClient()
  
  // Check for existing active session
  const { data: existingSession } = await supabase
    .from('user_sessions')
    .select('session_id')
    .eq('user_id', userId)
    .is('ended_at', null)
    .single()

  if (existingSession?.session_id) {
    return existingSession.session_id
  }

  // Create new session
  const sessionId = crypto.randomUUID()
  await supabase.from('user_sessions').insert({
    session_id: sessionId,
    user_id: userId,
    started_at: new Date().toISOString()
  })

  return sessionId
}

// Add proper type for event tracking
interface EventTrackingData {
  userId: string;
  eventType: string;
  eventName: string;
  eventData?: {
    role?: UserRole;
    artistId?: string;
    artworkId?: string;
    [key: string]: unknown;
  };
  sessionId?: string;
}

async function trackEvent(data: EventTrackingData) {
  const supabase = await createActionClient();
  
  await supabase.from('user_events').insert({
    user_id: data.userId,
    event_type: data.eventType,
    event_name: data.eventName,
    event_data: data.eventData,
    session_id: data.sessionId
  });
}

export async function trackPageView(pathname: string) {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  const headersList = await headers()
  const referer = headersList.get('referer')
  const userAgent = headersList.get('user-agent')

  const sessionId = await getOrCreateSession(user.id)
  
  await trackEvent({
    userId: user.id,
    eventType: 'page_view',
    eventName: pathname,
    eventData: {
      url: pathname,
      referrer: referer || '',
      userAgent: userAgent || '',
    },
    sessionId,
  })
}

// Export tracking functions
export async function trackOnboardingStep(userId: string, step: string) {
  await trackEvent({
    userId,
    eventType: 'onboarding',
    eventName: step
  })
}

export async function trackProfileCompletion({ fieldName, completed, metadata }: { 
  fieldName: string, 
  completed: boolean, 
  metadata: { userId: string } 
}) {
  await trackEvent({
    userId: metadata.userId,
    eventType: 'profile',
    eventName: 'profile_completion',
    eventData: { field: fieldName, completed }
  })
}

export async function trackArtistView(data: {
  artistId: string
  role: UserRole
  position: number
  totalArtists: number
  interactionType: 'click' | 'keyboard'
}) {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await trackEvent({
    userId: user.id,
    eventType: 'gallery_interaction',
    eventName: 'view_artist_profile',
    eventData: {
      artist_id: data.artistId,
      role: data.role,
      position: data.position,
      total_artists: data.totalArtists,
      interaction_type: data.interactionType
    }
  })
}

export async function trackArtistDirectoryView(data: {
  initialCount: number
  hasMore: boolean
}) {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await trackEvent({
    userId: user.id,
    eventType: 'gallery_interaction',
    eventName: 'artist_directory_view',
    eventData: {
      initial_count: data.initialCount,
      has_more: data.hasMore
    }
  })
}

// Main analytics functions
export async function getAdminAnalytics(): Promise<{ data?: AnalyticsData; error?: string }> {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const dateRange = getDefaultDateRange()
    const [platformMetrics, engagementMetrics, financialMetrics] = await Promise.all([
      fetchPlatformMetrics(supabase, dateRange),
      fetchEngagementMetrics(supabase, dateRange),
      fetchFinancialMetrics(supabase, dateRange)
    ])

    const { shares, likes, comments, follows } = engagementMetrics

    return {
      data: {
        // Overview Metrics
        pageViews: engagementMetrics.pageViews,
        uniqueVisitors: engagementMetrics.uniqueVisitors,
        averageSessionDuration: engagementMetrics.averageSessionDuration,
        bounceRate: engagementMetrics.bounceRate,

        // Platform Stats
        ...platformMetrics,

        // Engagement Metrics
        topPages: engagementMetrics.topPages,
        userEngagement: [],
        conversionRates: [
          {
            type: 'Artist Applications',
            rate: platformMetrics.pendingArtists
          },
          {
            type: 'Sales',
            rate: financialMetrics.revenueOverTime.length
          }
        ],

        // Gallery Performance
        galleryScans: engagementMetrics.galleryVisits,
        galleryVisits: engagementMetrics.galleryVisits,
        physicalVisits: engagementMetrics.physicalVisits,
        virtualVisits: engagementMetrics.virtualVisits,
        visitsByTime: [],

        // Social Metrics
        artworkViews: [],
        totalFavorites: likes,
        favoritesByDate: [],
        topFavoritedArtworks: [],

        // Platform Stats
        profileViews: engagementMetrics.totalSessions,
        followerCount: follows,
        followersGained: follows,

        // Financial Metrics
        totalSales: financialMetrics.totalRevenue,
        averageArtworkPrice: financialMetrics.averageOrderValue,
        revenueOverTime: financialMetrics.revenueOverTime,
        salesByArtwork: [],

        // Platform Usage
        featureUsage: [],
        mostUsedFeatures: [],

        // Demographics
        visitorLocations: [],
        deviceTypes: [],
        referralSources: [],

        // Platform Health
        communityMetrics: {
          engagementScore: Math.round(((shares + likes + comments + follows) / engagementMetrics.totalSessions) * 100),
          verificationImpact: 0,
          platformActivity: {
            comments,
            shares,
            responses: 0
          }
        },

        // Portfolio Stats
        portfolioMetrics: {
          completionRate: platformMetrics.totalArtworks > 0 ? 100 : 0,
          categoryDistribution: [],
          mediumPerformance: [],
          priceRangePerformance: []
        },

        // Exhibition Stats
        exhibitionMetrics: {
          badgeImpact: {
            beforeViews: 0,
            afterViews: 0,
            viewIncrease: 0
          },
          qrPerformance: {
            scans: engagementMetrics.galleryVisits,
            conversions: financialMetrics.revenueOverTime.length,
            conversionRate: engagementMetrics.galleryVisits 
              ? (financialMetrics.revenueOverTime.length / engagementMetrics.galleryVisits) * 100 
              : 0
          }
        },

        // Collector Stats
        collectorMetrics: {
          repeatCollectors: 0,
          averageCollectorValue: financialMetrics.averageOrderValue,
          geographicDistribution: [],
          pricePreferences: []
        }
      }
    }
  } catch (error: any) {
    console.error('Error fetching admin analytics:', error)
    return { error: error.message }
  }
}

export async function getArtistAnalytics(artistId: string): Promise<{ data?: AnalyticsData; error?: string }> {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  if (user.id !== artistId) {
    return { error: 'Unauthorized' }
  }

  try {
    const dateRange = getDefaultDateRange()
    const [engagementMetrics, financialMetrics] = await Promise.all([
      fetchEngagementMetrics(supabase, dateRange, artistId),
      fetchFinancialMetrics(supabase, dateRange, artistId)
    ])

    return {
      data: {
        // Core metrics
        pageViews: engagementMetrics.pageViews,
        uniqueVisitors: Math.floor(engagementMetrics.uniqueVisitors * 0.6), // Placeholder: 60% of total views
        averageSessionDuration: engagementMetrics.averageSessionDuration,
        bounceRate: engagementMetrics.bounceRate,
        totalSales: financialMetrics.totalRevenue,
        averageArtworkPrice: financialMetrics.averageOrderValue,
        revenueOverTime: financialMetrics.revenueOverTime,
        totalFavorites: engagementMetrics.likes,

        // Minimal placeholder data for required fields
        artworkViews: [],
        topPages: engagementMetrics.topPages,
        userEngagement: [],
        conversionRates: [],
        galleryScans: engagementMetrics.galleryVisits,
        galleryVisits: engagementMetrics.galleryVisits,
        physicalVisits: engagementMetrics.physicalVisits,
        virtualVisits: engagementMetrics.virtualVisits,
        visitsByTime: [],
        favoritesByDate: [],
        topFavoritedArtworks: [],
        profileViews: engagementMetrics.totalSessions,
        followerCount: engagementMetrics.follows,
        followersGained: engagementMetrics.follows,
        salesByArtwork: [],
        featureUsage: [],
        mostUsedFeatures: [],
        visitorLocations: [],
        deviceTypes: [],
        referralSources: [],
        communityMetrics: {
          engagementScore: 0,
          verificationImpact: 0,
          platformActivity: {
            comments: engagementMetrics.comments,
            shares: engagementMetrics.shares,
            responses: 0
          }
        },
        portfolioMetrics: {
          completionRate: 0,
          categoryDistribution: [],
          mediumPerformance: [],
          priceRangePerformance: []
        },
        exhibitionMetrics: {
          badgeImpact: {
            beforeViews: 0,
            afterViews: 0,
            viewIncrease: 0
          },
          qrPerformance: {
            scans: engagementMetrics.galleryVisits,
            conversions: financialMetrics.revenueOverTime.length,
            conversionRate: engagementMetrics.galleryVisits 
              ? (financialMetrics.revenueOverTime.length / engagementMetrics.galleryVisits) * 100 
              : 0
          }
        },
        collectorMetrics: {
          repeatCollectors: 0,
          averageCollectorValue: financialMetrics.averageOrderValue,
          geographicDistribution: [],
          pricePreferences: []
        }
      }
    }
  } catch (error: any) {
    console.error('Error fetching artist analytics:', error)
    return { error: error.message }
  }
} 