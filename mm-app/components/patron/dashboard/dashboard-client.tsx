'use client';

import { type FC, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Eye, Heart, FolderOpen, Users, Plus, BookOpen, History } from "lucide-react"
import { getCollectionStats } from '@/lib/actions/patron/collection-analytics'

interface DashboardClientProps {
  collections: Array<{
    id: string
    name: string
    is_private: boolean
    created_at: string
  }>
  profile: {
    id: string
    role: string
  }
}

export default function DashboardClient({ collections, profile }: DashboardClientProps) {
  const [stats, setStats] = useState<{
    totalCollections: number
    totalArtworks: number
    totalViews: number
    totalFollowing: number
  }>({
    totalCollections: collections.length,
    totalArtworks: 0,
    totalViews: 0,
    totalFollowing: 0
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get stats for all collections of the patron
        const promises = collections.map(collection => getCollectionStats(collection.id))
        const results = await Promise.all(promises)
        
        // Combine stats from all collections
        const totalStats = results.reduce((acc, result) => {
          // Safely handle null stats
          if (!result || !result.stats) return acc
          
          return {
            totalArtworks: acc.totalArtworks + (result.stats.unique_artists || 0),
            totalValue: (acc.totalValue || 0) + (result.stats.total_value || 0),
          }
        }, { totalArtworks: 0, totalValue: 0 })

        setStats({
          totalCollections: collections.length,
          totalArtworks: totalStats.totalArtworks,
          totalViews: 0,
          totalFollowing: 0
        })
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }
    fetchStats()
  }, [collections])

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6" role="main" aria-label="Patron Dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Patron Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant="outline" className="gap-1" role="status">
              <Users className="h-3 w-3" aria-hidden="true" />
              Patron
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <Card className="sm:hover:shadow-lg transition-shadow">
          <CardHeader className="sm:p-6">
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="sm:p-6">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" aria-hidden="true" />
                  Collections
                </p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalCollections}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Artworks
                </p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalArtworks}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Collection Views
                </p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  Following
                </p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalFollowing}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="sm:hover:shadow-lg transition-shadow">
          <CardHeader className="sm:p-6">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 sm:p-6">
            <Button 
              asChild 
              className="w-full justify-start text-left font-medium hover:bg-primary/90 h-11"
            >
              <Link 
                href="/patron/collections/new"
                role="button"
                aria-label="Create New Collection"
                className="flex items-center gap-2 px-4"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create New Collection
              </Link>
            </Button>
            <Button 
              asChild 
              variant="secondary" 
              className="w-full justify-start text-left font-medium hover:bg-secondary/90 h-11"
            >
              <Link 
                href="/patron/collections"
                role="button"
                aria-label="View Your Collections"
                className="flex items-center gap-2 px-4"
              >
                <FolderOpen className="h-4 w-4" aria-hidden="true" />
                View Collections
              </Link>
            </Button>
            <Button 
              asChild 
              variant="secondary" 
              className="w-full justify-start text-left font-medium hover:bg-secondary/90 h-11"
            >
              <Link 
                href="/patron/favorites"
                role="button"
                aria-label="View Your Favorites"
                className="flex items-center gap-2 px-4"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                View Favorites
              </Link>
            </Button>
            <Button 
              asChild 
              variant="secondary" 
              className="w-full justify-start text-left font-medium hover:bg-secondary/90 h-11"
            >
              <Link 
                href="/patron/history"
                role="button"
                aria-label="View Your History"
                className="flex items-center gap-2 px-4"
              >
                <History className="h-4 w-4" aria-hidden="true" />
                View History
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Collections */}
        <Card className="md:col-span-2">
          <CardHeader className="sm:p-6">
            <CardTitle>Recent Collections</CardTitle>
          </CardHeader>
          <CardContent className="sm:p-6">
            <div className="space-y-4">
              {collections.slice(0, 5).map((collection) => (
                <Link 
                  key={collection.id}
                  href={`/patron/collections/${collection.id}`}
                  className="block p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{collection.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(collection.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {collection.is_private && (
                      <Badge variant="secondary">Private</Badge>
                    )}
                  </div>
                </Link>
              ))}
              {collections.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No collections yet. Create your first collection to get started!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 