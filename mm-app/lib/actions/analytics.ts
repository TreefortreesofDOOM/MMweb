'use server'

import { createActionClient } from '@/lib/supabase/action'
import { trackEvent, trackFeatureUsage, getOrCreateSession } from '@/lib/analytics'
import { headers } from 'next/headers'

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

export async function trackArtistView(data: {
  artistId: string
  artistType: string
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
      artist_type: data.artistType,
      position: data.position,
      total_artists: data.totalArtists,
      interaction_type: data.interactionType
    }
  })
}

export async function trackFeatureUse(data: {
  featureName: string
  metadata?: Record<string, any>
}) {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await trackFeatureUsage({
    userId: user.id,
    featureName: data.featureName,
    metadata: data.metadata
  })
}

export async function trackArtistDirectoryView(data: {
  initialCount: number
  hasMore: boolean
}) {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await trackFeatureUsage({
    userId: user.id,
    featureName: 'artist_directory_view',
    metadata: {
      initial_count: data.initialCount,
      has_more: data.hasMore
    }
  })
}

export async function trackOnboardingStep(data: {
  step: string
  completed: boolean
  metadata?: Record<string, any>
}) {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await trackEvent({
    userId: user.id,
    eventType: 'onboarding',
    eventName: `step_${data.step}`,
    eventData: {
      completed: data.completed,
      ...data.metadata
    }
  })
}

export async function trackProfileCompletion(data: {
  fieldName: string
  completed: boolean
  metadata?: Record<string, any>
}) {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await trackEvent({
    userId: user.id,
    eventType: 'profile_completion',
    eventName: `field_${data.fieldName}`,
    eventData: {
      completed: data.completed,
      ...data.metadata
    }
  })
}

export async function trackArtistVerificationProgress(data: {
  step: string
  status: 'started' | 'completed' | 'failed'
  metadata?: Record<string, any>
}) {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await trackEvent({
    userId: user.id,
    eventType: 'artist_verification',
    eventName: `verification_${data.step}`,
    eventData: {
      status: data.status,
      ...data.metadata
    }
  })
} 