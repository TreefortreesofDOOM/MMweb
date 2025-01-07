'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { getFeed } from '@/lib/actions/feed/feed-actions'
import { FeedItem } from './ui/feed-item'
import { FeedSkeleton } from './ui/feed-skeleton'
import { Button } from '@/components/ui/button'
import { EmptyFeed } from './ui/empty-feed'
import type { FeedView as FeedViewType } from '@/lib/types/feed/feed-types'
import { logError } from '@/lib/utils/error-utils'

export interface FeedViewProps {
  patronId?: string
  artistId?: string
}

/**
 * FeedView component displays a paginated feed of artwork items
 * with infinite scroll and loading states.
 */
export function FeedView({ patronId, artistId }: FeedViewProps) {
  const [feed, setFeed] = useState<FeedViewType>({ items: [], hasMore: false })
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const { ref, inView } = useInView()
  const loadingRef = useRef(false)

  const userId = patronId || artistId

  // Memoize loadFeed to prevent recreation on every render
  const loadFeed = useCallback(async (currentPage: number) => {
    // Use ref to prevent concurrent loads
    if (loadingRef.current) return
    loadingRef.current = true

    logError({
      code: 'UI_FEED_001',
      message: 'Load feed called',
      context: 'FeedView:loadFeedStart',
      type: 'debug',
      userId,
      timestamp: new Date().toISOString(),
      metadata: { currentPage, isInitialLoad }
    })

    // Early return if no userId
    if (!userId) {
      logError({
        code: 'UI_FEED_002',
        message: 'No user ID provided for feed',
        context: 'FeedView:noUserId',
        type: 'warn',
        timestamp: new Date().toISOString()
      })
      setIsLoading(false)
      setIsInitialLoad(false)
      loadingRef.current = false
      return
    }

    setIsLoading(true)
    try {
      const feedData = await getFeed(userId, currentPage)
      logError({
        code: 'UI_FEED_003',
        message: 'Feed data received',
        context: 'FeedView:dataReceived',
        type: 'debug',
        userId,
        timestamp: new Date().toISOString(),
        metadata: {
          currentPage,
          itemCount: feedData.items.length,
          hasMore: feedData.hasMore
        }
      })

      setFeed(prev => ({
        items: currentPage === 1 ? feedData.items : [...prev.items, ...feedData.items],
        hasMore: feedData.hasMore
      }))
    } catch (error) {
      logError({
        code: 'UI_FEED_004',
        message: 'Feed load error',
        context: 'FeedView:loadError',
        type: 'error',
        userId,
        timestamp: new Date().toISOString(),
        metadata: {
          currentPage,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      setFeed({ items: [], hasMore: false })
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
      loadingRef.current = false
    }
  }, [userId]) // Only depend on userId

  // Effect for initial load
  useEffect(() => {
    if (userId) {
      loadFeed(1)
    }
  }, [userId, loadFeed])

  // Effect for page changes
  useEffect(() => {
    if (page > 1 && !isLoading && userId) {
      loadFeed(page)
    }
  }, [page, userId, loadFeed])

  // Effect for infinite scroll
  useEffect(() => {
    if (inView && feed.hasMore && !isInitialLoad && !isLoading) {
      setPage(p => p + 1)
    }
  }, [inView, feed.hasMore, isInitialLoad, isLoading])

  // Show loading skeleton on initial load
  if (isInitialLoad) {
    return <FeedSkeleton />
  }

  // Show empty state when no items and not loading
  if (feed.items.length === 0 && !isLoading) {
    return <EmptyFeed isPatron={!!patronId} />
  }

  return (
    <div className="space-y-6">
      <div role="feed" aria-busy={isLoading}>
        {feed.items.map(item => (
          <FeedItem key={item.id} item={item} />
        ))}
      </div>
      
      {isLoading && page > 1 && (
        <div role="status" aria-label="Loading more items">
          <FeedSkeleton />
        </div>
      )}
      
      {feed.hasMore && !isLoading && (
        <div ref={ref} className="flex justify-center">
          <Button 
            onClick={() => setPage(p => p + 1)}
            variant="outline"
            className="w-full sm:w-auto"
            aria-label="Load more feed items"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
} 