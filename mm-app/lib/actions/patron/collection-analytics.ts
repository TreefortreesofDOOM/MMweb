'use server'

import { createActionClient } from '@/lib/supabase/action'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

interface ViewEvent {
  collection_id: string
  viewer_id?: string | null
  source?: string
  referrer?: string | null
}

interface CollectionItem {
  artwork_id: string;
  artworks: {
    price: number;
    artist_id: string;
    created_at: string;
  } | null;
}

interface CollectionItemWithRelations {
  artwork_id: string;
  transaction_id: string;
  transactions: {
    amount_total: number;
    status: string;
    created_at: string;
  };
  artworks: {
    artist_id: string;
  };
}

export async function trackCollectionView({
  collection_id,
  viewer_id = null,
  source = 'direct',
  referrer = null,
}: ViewEvent) {
  const supabase = await createActionClient()

  const { error } = await supabase
    .from('collection_views')
    .insert({
      collection_id,
      viewer_id,
      source,
      referrer,
      viewed_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error tracking collection view:', error)
    // Don't throw error to avoid breaking the user experience
  }
}

export async function getCollectionAnalytics(collection_id: string) {
  const supabase = await createActionClient()

  const { data, error } = await supabase
    .from('collection_views')
    .select('*')
    .eq('collection_id', collection_id)
    .order('viewed_at', { ascending: false })

  if (error) {
    console.error('Error fetching collection analytics:', error)
    throw error
  }

  // Calculate analytics
  const totalViews = data.length
  const uniqueViewers = new Set(data.filter(view => view.viewer_id).map(view => view.viewer_id)).size
  const viewsBySource = data.reduce((acc, view) => {
    acc[view.source] = (acc[view.source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const last30Days = data.filter(view => {
    const viewDate = new Date(view.viewed_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return viewDate >= thirtyDaysAgo
  }).length

  return {
    totalViews,
    uniqueViewers,
    viewsBySource,
    last30Days,
    recentViews: data.slice(0, 10), // Last 10 views
  }
}

export async function getCollectionStats(collectionId: string) {
  try {
    // Use action client for RLS operations
    const supabase = await createActionClient()
    const serviceClient = createServiceRoleClient()
    
    // Verify user has access to this collection first (RLS)
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .single()

    if (collectionError || !collection) {
      throw new Error('Collection not found or access denied')
    }

    // 1. Get collection items with RLS
    const { data: items, error: itemsError } = await supabase
      .from('collection_items')
      .select('artwork_id, transaction_id')
      .eq('collection_id', collectionId)

    if (itemsError) throw itemsError
    if (!items || !items.length) {
      return { error: null, stats: null }
    }

    // 2. Get transactions using service role to bypass RLS
    const { data: transactions, error: txError } = await serviceClient
      .from('transactions')
      .select('id, amount_total, status, created_at, artist_id')
      .in('id', items.map(item => item.transaction_id))
      .eq('status', 'succeeded')

    if (txError) throw txError

    const validTransactions = transactions?.map(tx => ({
      amount: tx.amount_total / 100,
      artist_id: tx.artist_id,
      created_at: tx.created_at
    })) || []
    
    return {
      error: null,
      stats: {
        total_value: validTransactions.reduce((sum, t) => sum + t.amount, 0),
        average_price: validTransactions.length ? 
          validTransactions.reduce((sum, t) => sum + t.amount, 0) / validTransactions.length : 0,
        unique_artists: new Set(validTransactions.map(t => t.artist_id)).size,
        days_since_last_transaction: validTransactions.length ? 
          Math.floor((Date.now() - new Date(Math.max(...validTransactions
            .filter(t => t.created_at !== null)
            .map(t => new Date(t.created_at!).getTime())
          )).getTime()) / (1000 * 60 * 60 * 24)) :
          null
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error'
    console.error('Error fetching collection stats:', errorMessage)
    return {
      error: errorMessage,
      stats: null
    }
  }
} 