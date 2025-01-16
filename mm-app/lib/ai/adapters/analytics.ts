import { createServiceRoleClient } from '@/lib/supabase/service-role'
import type { Database } from '@/lib/types/database.types'
import type { UserRole } from '@/lib/types/custom-types'

type UserSession = Database['public']['Tables']['user_sessions']['Row']
type UserEvent = Database['public']['Tables']['user_events']['Row']

interface ArtworkViewEventData {
  artwork_id: string
}

// Error types
class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Return types for each analytics function
export interface MetricsOverviewResult {
  totalPageViews: number
  uniqueVisitors: number
  averageSessionDuration: string
  bounceRate: string
}

export interface TopPagesResult {
  path: string
  views: number
}

export interface UserEngagementResult {
  totalSessions: number
  activeUsers: number
  averageSessionsPerUser: number
  eventCounts: Record<string, number>
}

export interface ConversionMetricsResult {
  signupConversions: number
  subscriptionConversions: number
  purchaseConversions: number
  totalConversions: number
}

export interface FeatureUsageResult {
  feature: string
  totalUses: number
  uniqueUsers: number
  averageUsesPerUser: number
}

export interface GalleryVisitsResult {
  totalVisits: number
  physicalVisits: number
  virtualVisits: number
  averageDuration: string
}

export interface SocialMetricsResult {
  shares: number
  likes: number
  comments: number
  follows: number
  totalEngagements: number
}

export interface ArtworkMetricsResult {
  totalArtworks: number
  totalViews: number
  uniqueArtworkViews: number
  averageViewsPerArtwork: number
}

interface ArtistFeatureMetricsResult {
  role: UserRole
  status: string
  totalArtists: number
  featuresEnabled: number
  averageFeaturesPerArtist: number
}

// Event data types
interface PageViewEventData {
  url: string
  referrer?: string
  duration?: number
  [key: string]: string | number | undefined
}

type UserEventWithData = Omit<UserEvent, 'event_data'> & {
  event_data: PageViewEventData
}

// Validation utilities
function isValidISODate(dateString: string): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

function validateDateRange(startDate: string, endDate: string): void {
  if (!isValidISODate(startDate)) {
    throw new ValidationError('Invalid start date format')
  }
  if (!isValidISODate(endDate)) {
    throw new ValidationError('Invalid end date format')
  }
  if (new Date(startDate) > new Date(endDate)) {
    throw new ValidationError('Start date must be before end date')
  }
}

function validateAnalyticsParams(params: Record<string, any>): void {
  if (!params.startDate || !params.endDate) {
    throw new ValidationError('Start and end dates are required')
  }
  validateDateRange(params.startDate, params.endDate)
  
  // Validate optional numeric parameters
  if (params.limit && (typeof params.limit !== 'number' || params.limit < 1)) {
    throw new ValidationError('Limit must be a positive number')
  }
}

export interface AnalyticsFunction {
  name: string
  description: string
  parameters: {
    startDate: string
    endDate: string
    [key: string]: any
  }
}

export const analyticsFunctions = [{
  name: "getMetricsOverview",
  description: "Get overview of key analytics metrics for a specific time period",
  parameters: {
    startDate: "Start date in ISO format",
    endDate: "End date in ISO format"
  }
}, {
  name: "getTopPages",
  description: "Get most visited pages and their view counts",
  parameters: {
    startDate: "Start date in ISO format",
    endDate: "End date in ISO format",
    limit: "Number of pages to return (default: 5)"
  }
}, {
  name: "getUserEngagement",
  description: "Get user engagement metrics including sessions and events over time",
  parameters: {
    startDate: "Start date in ISO format",
    endDate: "End date in ISO format"
  }
}, {
  name: "getConversionMetrics",
  description: "Get artist conversion rates and statistics",
  parameters: {
    startDate: "Start date in ISO format",
    endDate: "End date in ISO format"
  }
}, {
  name: "getFeatureUsage",
  description: "Get feature adoption and usage statistics",
  parameters: {
    startDate: "Start date in ISO format",
    endDate: "End date in ISO format",
    feature: "Specific feature to analyze (optional)"
  }
}, {
  name: "getGalleryVisits",
  description: "Get gallery visit statistics (physical and virtual)",
  parameters: {
    startDate: "Start date in ISO format",
    endDate: "End date in ISO format"
  }
}, {
  name: "getSocialMetrics",
  description: "Get social engagement metrics (follows, favorites)",
  parameters: {
    startDate: "Start date in ISO format",
    endDate: "End date in ISO format"
  }
}, {
  name: "getArtworkMetrics",
  description: "Get artwork statistics and trends",
  parameters: {
    startDate: "Start date in ISO format",
    endDate: "End date in ISO format",
    status: "Filter by artwork status (optional)"
  }
}, {
  name: "getVerificationMetrics",
  description: "Get artist verification funnel and progress metrics",
  parameters: {
    startDate: "Start date in ISO format",
    endDate: "End date in ISO format"
  }
}, {
  name: "getArtistFeatureMetrics",
  description: "Get artist feature enablement and usage statistics",
  parameters: {
    startDate: "Start date in ISO format",
    endDate: "End date in ISO format",
    artistType: "Filter by artist type (optional)"
  }
}]

export async function executeAnalyticsFunction(
  name: string,
  args: Record<string, any>
): Promise<
  | MetricsOverviewResult
  | TopPagesResult[]
  | UserEngagementResult
  | ConversionMetricsResult
  | FeatureUsageResult
  | GalleryVisitsResult
  | SocialMetricsResult
  | ArtworkMetricsResult
  | ArtistFeatureMetricsResult
> {
  try {
    // Validate parameters
    validateAnalyticsParams(args)

    const supabase = createServiceRoleClient()
    const { startDate, endDate, status, artistType, feature } = args

    switch (name) {
      case 'getMetricsOverview': {
        const { data: pageViews, error: pageViewsError } = await supabase
          .from('user_events')
          .select('*')
          .eq('event_type', 'page_view')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (pageViewsError) throw new DatabaseError(pageViewsError.message)

        const { data: sessions, error: sessionsError } = await supabase
          .from('user_sessions')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (sessionsError) throw new DatabaseError(sessionsError.message)

        const uniqueVisitors = new Set(sessions?.map(s => s.user_id)).size
        const totalSessions = sessions?.length || 0
        const averageSessionDuration = sessions?.reduce((acc, s) => {
          if (s.ended_at) {
            return acc + (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime())
          }
          return acc
        }, 0) / (totalSessions || 1) / 1000 / 60 // Convert to minutes

        return {
          totalPageViews: pageViews?.length || 0,
          uniqueVisitors,
          averageSessionDuration: averageSessionDuration.toFixed(1),
          bounceRate: ((sessions?.filter(s => !s.ended_at).length || 0) / totalSessions * 100).toFixed(1)
        }
      }

      case 'getTopPages': {
        const { data: pageViews, error: pageViewsError } = await supabase
          .from('user_events')
          .select('event_data')
          .eq('event_type', 'page_view')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (pageViewsError) throw new DatabaseError(pageViewsError.message)

        const pageViewsMap = (pageViews || []).reduce<Record<string, number>>((acc, pv) => {
          const eventData = pv.event_data as PageViewEventData
          const path = eventData?.url || 'unknown'
          acc[path] = (acc[path] || 0) + 1
          return acc
        }, {})

        return Object.entries(pageViewsMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, args.limit || 5)
          .map(([path, views]) => ({ path, views }))
      }

      case 'getUserEngagement': {
        const { data: sessions, error: sessionsError } = await supabase
          .from('user_sessions')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (sessionsError) throw new DatabaseError(sessionsError.message)

        const { data: events, error: eventsError } = await supabase
          .from('user_events')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (eventsError) throw new DatabaseError(eventsError.message)

        const activeUsers = new Set(sessions?.map(s => s.user_id)).size
        const totalSessions = sessions?.length || 0
        const eventCounts = (events || []).reduce<Record<string, number>>((acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1
          return acc
        }, {})

        return {
          totalSessions,
          activeUsers,
          averageSessionsPerUser: activeUsers ? totalSessions / activeUsers : 0,
          eventCounts
        }
      }

      case 'getGalleryVisits': {
        const { data: visits, error: visitsError } = await supabase
          .from('gallery_visits')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (visitsError) throw new DatabaseError(visitsError.message)

        const physicalVisits = visits?.filter(v => v.visit_type === 'physical').length || 0
        const virtualVisits = visits?.filter(v => v.visit_type === 'virtual').length || 0

        return {
          totalVisits: visits?.length || 0,
          physicalVisits,
          virtualVisits,
          averageDuration: '30' // TODO: Implement duration tracking
        }
      }

      case 'getConversionMetrics': {
        const { data: conversions, error: conversionsError } = await supabase
          .from('user_events')
          .select('*')
          .in('event_type', ['signup', 'subscription', 'purchase'])
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (conversionsError) throw new DatabaseError(conversionsError.message)

        const signups = conversions?.filter(c => c.event_type === 'signup').length || 0
        const subscriptions = conversions?.filter(c => c.event_type === 'subscription').length || 0
        const purchases = conversions?.filter(c => c.event_type === 'purchase').length || 0

        return {
          signupConversions: signups,
          subscriptionConversions: subscriptions,
          purchaseConversions: purchases,
          totalConversions: signups + subscriptions + purchases
        }
      }

      case 'getFeatureUsage': {
        if (!feature) throw new ValidationError('Feature parameter is required')

        const { data: featureEvents, error: featureError } = await supabase
          .from('user_events')
          .select('*')
          .eq('event_type', 'feature_use')
          .eq('event_data->feature', feature)
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (featureError) throw new DatabaseError(featureError.message)

        const uniqueUsers = new Set(featureEvents?.map(e => e.user_id)).size

        return {
          feature,
          totalUses: featureEvents?.length || 0,
          uniqueUsers,
          averageUsesPerUser: uniqueUsers ? (featureEvents?.length || 0) / uniqueUsers : 0
        }
      }

      case 'getSocialMetrics': {
        const { data: socialEvents, error: socialError } = await supabase
          .from('user_events')
          .select('*')
          .in('event_type', ['share', 'like', 'comment', 'follow'])
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (socialError) throw new DatabaseError(socialError.message)

        const shares = socialEvents?.filter(e => e.event_type === 'share').length || 0
        const likes = socialEvents?.filter(e => e.event_type === 'like').length || 0
        const comments = socialEvents?.filter(e => e.event_type === 'comment').length || 0
        const follows = socialEvents?.filter(e => e.event_type === 'follow').length || 0

        return {
          shares,
          likes,
          comments,
          follows,
          totalEngagements: shares + likes + comments + follows
        }
      }

      case 'getArtworkMetrics': {
        const { data: artworks, error: artworksError } = await supabase
          .from('artworks')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (artworksError) throw new DatabaseError(artworksError.message)

        const { data: views, error: viewsError } = await supabase
          .from('user_events')
          .select('*')
          .eq('event_type', 'artwork_view')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (viewsError) throw new DatabaseError(viewsError.message)

        const totalArtworks = artworks?.length || 0
        const totalViews = views?.length || 0
        const uniqueArtworkViews = new Set(views?.map(v => (v.event_data as unknown as ArtworkViewEventData)?.artwork_id)).size

        return {
          totalArtworks,
          totalViews,
          uniqueArtworkViews,
          averageViewsPerArtwork: totalArtworks ? totalViews / totalArtworks : 0
        }
      }

      case 'getArtistFeatureMetrics': {
        if (!artistType) throw new ValidationError('Artist type parameter is required')
        if (!status) throw new ValidationError('Status parameter is required')

        const { data: artists, error: artistsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', artistType)
          .eq('artist_status', status)
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (artistsError) throw new DatabaseError(artistsError.message)

        const { data: features, error: featuresError } = await supabase
          .from('artist_features')
          .select('*')
          .in('artist_id', artists?.map(a => a.id) || [])

        if (featuresError) throw new DatabaseError(featuresError.message)

        const totalArtists = artists?.length || 0
        const featuresEnabled = features?.length || 0

        return {
          role: artistType,
          status,
          totalArtists,
          featuresEnabled,
          averageFeaturesPerArtist: totalArtists ? featuresEnabled / totalArtists : 0
        }
      }

      default:
        throw new Error(`Unknown analytics function: ${name}`)
    }
  } catch (error) {
    console.error(`Analytics function "${name}" failed:`, error)
    throw error instanceof ValidationError || error instanceof DatabaseError
      ? error
      : new Error('Analytics function failed')
  }
} 