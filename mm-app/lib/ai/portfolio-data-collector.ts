import { createBrowserClient } from '@/lib/supabase/supabase-client'
import type { Database } from '@/lib/types/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Artwork = Database['public']['Tables']['artworks']['Row']

export interface PortfolioData {
  profile: Profile
  artworks: Artwork[]
  transactions: Transaction[]
  engagementMetrics: {
    totalViews: number
    totalFavorites: number
    averageViewsPerArtwork: number
    averageFavoritesPerArtwork: number
  }
}

export interface PortfolioAnalysis {
  totalRevenue: number
  bestSellers: {
    artworkId: string
    title: string
    revenue: number
    sales: number
  }[]
  daysToSell: {
    average: number
    min: number
    max: number
  }
  salesPerMonth: {
    month: string
    count: number
    revenue: number
  }[]
  recentTrends: {
    percentageChange: number
    timeframe: string
  }
}

export interface PortfolioAnalysisResponse {
  data: PortfolioData
  analysis: PortfolioAnalysis
}

export async function collectPortfolioData(profileId: string): Promise<PortfolioData> {
  const supabase = createBrowserClient()

  // Get artist profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (profileError || !profile) {
    throw new Error('Failed to fetch artist profile')
  }

  // Get published artworks
  const { data: artworks, error: artworksError } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', profileId)
    .eq('status', 'published')

  if (artworksError || !artworks) {
    throw new Error('Failed to fetch artworks')
  }

  // Get engagement metrics
  const { data: favorites, error: favoritesError } = await supabase
    .from('artwork_favorites')
    .select('artwork_id')
    .in('artwork_id', artworks.map((a: Artwork) => a.id))

  if (favoritesError) {
    throw new Error('Failed to fetch favorites')
  }

  // Calculate engagement metrics
  const totalViews = artworks.reduce((sum: number, artwork: Artwork) => {
    const views = (artwork.ai_metadata as any)?.views || 0
    return sum + views
  }, 0)
  const totalFavorites = favorites?.length || 0

  const engagementMetrics = {
    totalViews,
    totalFavorites,
    averageViewsPerArtwork: artworks.length > 0 ? totalViews / artworks.length : 0,
    averageFavoritesPerArtwork: artworks.length > 0 ? totalFavorites / artworks.length : 0
  }

  // Get transactions
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .eq('artist_id', profileId)
    .eq('status', 'succeeded')

  if (transactionsError) {
    console.error('Transaction fetch error:', JSON.stringify(transactionsError, null, 2))
    // Handle infinite recursion error gracefully
    if (transactionsError.code === '42P17') {
      console.warn('Transaction policy recursion detected - proceeding with empty transactions array')
      return {
        profile,
        artworks,
        transactions: [],
        engagementMetrics
      }
    }
    throw new Error(`Failed to fetch transactions: ${transactionsError.message || 'Unknown error'}`)
  }

  // Use empty array if no transactions found
  const validTransactions = transactions || []

  return {
    profile,
    artworks,
    transactions: validTransactions,
    engagementMetrics
  }
}

export function analyzePortfolioData(data: PortfolioData): PortfolioAnalysis {
  const { transactions, artworks } = data

  // Handle case with no transactions
  if (!transactions.length) {
    return {
      totalRevenue: 0,
      bestSellers: [],
      daysToSell: {
        average: 0,
        min: 0,
        max: 0
      },
      salesPerMonth: [],
      recentTrends: {
        percentageChange: 0,
        timeframe: 'last_3_months'
      }
    }
  }

  // Calculate total revenue
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount_total || 0), 0)

  // Find best sellers
  const salesByArtwork = transactions.reduce((acc, t) => {
    if (!t.artwork_id) return acc
    if (!acc[t.artwork_id]) {
      acc[t.artwork_id] = { revenue: 0, sales: 0 }
    }
    acc[t.artwork_id].revenue += t.amount_total
    acc[t.artwork_id].sales += 1
    return acc
  }, {} as Record<string, { revenue: number; sales: number }>)

  const bestSellers = Object.entries(salesByArtwork)
    .map(([artworkId, stats]) => ({
      artworkId,
      title: artworks.find(a => a.id === artworkId)?.title || 'Unknown',
      revenue: stats.revenue,
      sales: stats.sales
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Calculate days to sell
  const daysToSellArray = transactions
    .filter(t => t.artwork_id)
    .map(t => {
      const artwork = artworks.find(a => a.id === t.artwork_id)
      if (!artwork || !t.created_at || !artwork.created_at) return null
      const saleDate = new Date(t.created_at)
      const createDate = new Date(artwork.created_at)
      return Math.floor((saleDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24))
    })
    .filter((days): days is number => days !== null)

  const daysToSell = {
    average: daysToSellArray.reduce((sum, days) => sum + days, 0) / daysToSellArray.length || 0,
    min: Math.min(...daysToSellArray) || 0,
    max: Math.max(...daysToSellArray) || 0
  }

  // Calculate sales per month
  const salesPerMonth = transactions.reduce((acc, t) => {
    if (!t.created_at) return acc
    const date = new Date(t.created_at)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!acc[month]) {
      acc[month] = { count: 0, revenue: 0 }
    }
    acc[month].count += 1
    acc[month].revenue += t.amount_total
    return acc
  }, {} as Record<string, { count: number; revenue: number }>)

  // Calculate recent trends
  const now = new Date()
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

  const recentSales = transactions.filter(t => t.created_at && new Date(t.created_at) >= threeMonthsAgo)
  const previousSales = transactions.filter(t => {
    if (!t.created_at) return false
    const date = new Date(t.created_at)
    return date >= sixMonthsAgo && date < threeMonthsAgo
  })

  const recentRevenue = recentSales.reduce((sum, t) => sum + t.amount_total, 0)
  const previousRevenue = previousSales.reduce((sum, t) => sum + t.amount_total, 0)

  const percentageChange = previousRevenue > 0 
    ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
    : 0

  return {
    totalRevenue,
    bestSellers,
    daysToSell,
    salesPerMonth: Object.entries(salesPerMonth).map(([month, stats]) => ({
      month,
      count: stats.count,
      revenue: stats.revenue
    })),
    recentTrends: {
      percentageChange,
      timeframe: 'last_3_months'
    }
  }
} 