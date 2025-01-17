export interface AnalyticsData {
  // Overview Metrics
  pageViews: number
  uniqueVisitors: number
  averageSessionDuration: number
  bounceRate: number
  
  // Admin Platform Stats
  totalUsers?: number
  totalArtists?: number
  totalArtworks?: number
  pendingApplications?: number
  
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
  salesByArtwork: {
    artworkId: string
    title: string
    sales: number
    revenue: number
  }[]
  
  // Feature Usage
  featureUsage: { feature: string; usageCount: number }[]
  mostUsedFeatures: { feature: string; usageCount: number }[]
  
  // Demographics
  visitorLocations: { location: string; count: number }[]
  deviceTypes: { type: string; count: number }[]
  referralSources: { source: string; count: number }[]
  
  // Community Metrics
  communityMetrics: {
    engagementScore: number
    verificationImpact: number
    platformActivity: {
      comments: number
      shares: number
      responses: number
    }
  }
  
  // Portfolio Stats
  portfolioMetrics: {
    completionRate: number
    categoryDistribution: { category: string; count: number }[]
    mediumPerformance: { medium: string; views: number }[]
    priceRangePerformance: { range: string; sales: number }[]
  }
  
  // Exhibition Stats
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
  
  // Collector Stats
  collectorMetrics: {
    repeatCollectors: number
    averageCollectorValue: number
    geographicDistribution: { location: string; count: number }[]
    pricePreferences: { range: string; count: number }[]
  }
} 