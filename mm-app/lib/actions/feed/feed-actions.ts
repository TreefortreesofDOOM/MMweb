'use server'

import { createActionClient } from '@/lib/supabase/supabase-action'
import { ErrorService } from '@/lib/utils/error/error-service-utils'
import type { FeedView, Profile, Artwork } from '@/lib/types/feed-types'
import type { Json } from '@/lib/types/database.types'
import { MM_AI_PROFILE_ID } from '@/lib/constants/mm-ai-constants'

type ImageObject = {
  url: string
  width?: number
  height?: number
  blur_data?: string
  [key: string]: string | number | undefined
}

const errorService = ErrorService.getInstance()

export async function getFeed(
  userId: string,
  page = 1
): Promise<FeedView> {
  if (!userId) {
    errorService.logError({
      code: 'FEED_001',
      message: 'Feed requested without userId',
      context: 'getFeed:initialization',
      type: 'validation',
      timestamp: new Date().toISOString(),
      metadata: { page }
    })
    return { items: [], hasMore: false }
  }

  const supabase = await createActionClient()
  const ITEMS_PER_PAGE = 20
  
  try {
    // Log the start of profile verification
    errorService.logError({
      code: 'FEED_002',
      message: 'Starting profile verification',
      context: 'getFeed:profileCheck',
      type: 'debug',
      userId,
      timestamp: new Date().toISOString(),
      metadata: { page }
    })

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError) {
      errorService.logError({
        code: 'FEED_003',
        message: 'Profile fetch error',
        context: 'getFeed:profileError',
        type: 'database',
        userId,
        timestamp: new Date().toISOString(),
        metadata: { 
          error: profileError.message,
          code: profileError.code,
          page 
        }
      })
      throw new Error('Unable to verify user access')
    }

    if (!profile) {
      errorService.logError({
        code: 'FEED_004',
        message: 'Profile not found',
        context: 'getFeed:profileMissing',
        type: 'data',
        userId,
        timestamp: new Date().toISOString(),
        metadata: { page }
      })
      return { items: [], hasMore: false }
    }

    // Log start of follows fetch with more details
    errorService.logError({
      code: 'FEED_005',
      message: 'Starting follows fetch',
      context: 'getFeed:followsCheck',
      type: 'debug',
      userId,
      timestamp: new Date().toISOString(),
      metadata: { 
        userRole: profile.role,
        page,
        profile
      }
    })

    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)

    if (followsError) {
      errorService.logError({
        code: 'FEED_006',
        message: 'Follows fetch error',
        context: 'getFeed:followsError',
        type: 'database',
        userId,
        timestamp: new Date().toISOString(),
        metadata: { 
          error: followsError.message,
          code: followsError.code,
          page 
        }
      })
      return { items: [], hasMore: false }
    }

    const followedIds = follows?.map(f => f.following_id) || []
    
    // Log follows data
    errorService.logError({
      code: 'FEED_007',
      message: followedIds.length === 0 ? 'User has no follows' : `User follows ${followedIds.length} artists`,
      context: 'getFeed:followsData',
      type: followedIds.length === 0 ? 'warn' : 'debug',
      userId,
      timestamp: new Date().toISOString(),
      metadata: { 
        followedIds,
        followCount: followedIds.length,
        page 
      }
    })

    if (followedIds.length === 0) {
      return { items: [], hasMore: false }
    }

    // Log start of artworks fetch with query details
    errorService.logError({
      code: 'FEED_008',
      message: 'Starting artworks fetch',
      context: 'getFeed:artworksCheck',
      type: 'debug',
      userId,
      timestamp: new Date().toISOString(),
      metadata: { 
        followCount: followedIds.length,
        followedIds,
        page,
        range: [(page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE],
        query: {
          status: 'published',
          orderBy: 'created_at DESC'
        }
      }
    })

    const { data: items, error: itemsError } = await supabase
      .from('artworks')
      .select(`
        id,
        title,
        images,
        created_at,
        ai_generated,
        artist:profiles!artist_id (
          id,
          name,
          avatar_url
        )
      `)
      .or(`artist_id.in.(${followedIds.join(',')}),artist_id.eq.${MM_AI_PROFILE_ID}`)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    // Log raw items data
    errorService.logError({
      code: 'FEED_009',
      message: items ? `Found ${items.length} artworks` : 'No artworks found',
      context: 'getFeed:artworksData',
      type: items?.length ? 'debug' : 'warn',
      userId,
      timestamp: new Date().toISOString(),
      metadata: {
        itemCount: items?.length || 0,
        followCount: followedIds.length,
        page,
        items: items?.map(item => ({
          id: item.id,
          title: item.title,
          hasImages: !!item.images,
          hasArtist: !!item.artist
        }))
      }
    })

    if (itemsError) {
      errorService.logError({
        code: 'FEED_010',
        message: 'Failed to fetch artwork items',
        context: 'getFeed:artworksQuery',
        type: 'error',
        userId,
        timestamp: new Date().toISOString(),
        metadata: {
          error: itemsError.message,
          code: itemsError.code,
          followCount: followedIds.length,
          page,
          query: {
            followedIds,
            range: [(page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE]
          }
        }
      })
      throw new Error('Unable to load feed items')
    }

    // Data transformation error logging
    const feedItems = items?.map(item => {
      if (!item.created_at || !item.images || !item.artist) {
        errorService.logError({
          code: 'FEED_011',
          message: 'Invalid artwork data structure',
          context: 'getFeed:dataTransformation',
          type: 'warn',
          userId,
          timestamp: new Date().toISOString(),
          metadata: {
            artworkId: item.id,
            item,
            missingFields: [
              !item.created_at && 'created_at',
              !item.images && 'images',
              !item.artist && 'artist'
            ].filter(Boolean)
          }
        })
        return null
      }

      // Handle images array safely, expecting array of objects with url property
      let images: string[] = []
      if (Array.isArray(item.images)) {
        images = (item.images as unknown as ImageObject[])
          .filter((img): img is ImageObject => 
            typeof img === 'object' && 
            img !== null && 
            typeof img.url === 'string'
          )
          .map(img => img.url)
      }

      if (images.length === 0) {
        errorService.logError({
          code: 'FEED_012',
          message: 'Artwork has no valid images',
          context: 'getFeed:imageValidation',
          type: 'warn',
          userId,
          timestamp: new Date().toISOString(),
          metadata: {
            artworkId: item.id,
            rawImages: item.images
          }
        })
        return null
      }

      const artist: Profile = {
        id: item.artist.id,
        name: item.artist.name || 'Unknown Artist',
        avatar_url: item.artist.avatar_url
      }

      return {
        id: item.id,
        type: 'artwork' as const,
        content: {
          id: item.id,
          title: item.title || 'Untitled',
          images,
          created_at: item.created_at,
          ai_generated: item.ai_generated
        },
        creator: artist,
        timestamp: item.created_at,
        isSystemContent: item.ai_generated === true || item.artist.id === MM_AI_PROFILE_ID
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null) || []

    // Log final transformed items
    errorService.logError({
      code: 'FEED_013',
      message: `Transformed ${feedItems.length} valid items`,
      context: 'getFeed:finalItems',
      type: 'debug',
      userId,
      timestamp: new Date().toISOString(),
      metadata: {
        originalCount: items?.length || 0,
        transformedCount: feedItems.length,
        page,
        hasMore: (items?.length || 0) === ITEMS_PER_PAGE
      }
    })

    return {
      items: feedItems,
      hasMore: (items?.length || 0) === ITEMS_PER_PAGE
    }
  } catch (error) {
    console.error('Feed error:', error)
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred while loading your feed')
  }
} 