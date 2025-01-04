'use client'

import { AdminDashboard } from './admin-dashboard'
import { ArtistDashboard } from './artist-dashboard'

interface AnalyticsDashboardProps {
  artistId?: string
}

export function AnalyticsDashboard({ artistId }: AnalyticsDashboardProps) {
  if (artistId) {
    return <ArtistDashboard artistId={artistId} />
  }
  return <AdminDashboard />
} 