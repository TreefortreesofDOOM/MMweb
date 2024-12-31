import { createClient } from '@/lib/supabase/supabase-server'
import { ArtistsClient } from './artists-client'
import { Suspense } from 'react'
import { ErrorBoundary } from './error-boundary'
import Loading from './loading'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { ARTIST_ROLES, type ArtistRole } from '@/lib/types/custom-types'
import type { ArtistWithCount } from './artists-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artists | Meaning Machine',
  description: 'Browse our curated artists.',
}

export const dynamic = 'force-dynamic'

export default async function ArtistsPage(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const { data: artists } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      full_name,
      avatar_url,
      bio,
      instagram,
      website,
      created_at,
      exhibition_badge,
      view_count,
      role,
      location,
      artworks (count)
    `)
    .in('role', ['verified_artist', 'emerging_artist'])
    .order('exhibition_badge', { ascending: false, nullsFirst: false })
    .order('role', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(0, 11)

  // Transform the data to include artwork counts
  const transformedArtists: ArtistWithCount[] = artists?.map(artist => ({
    ...artist,
    artist_type: artist.role === 'verified_artist' ? 'verified' : 'emerging',
    artworks: [{ count: artist.artworks?.[0]?.count || 0 }] as [{ count: number }]
  })) || []

  return (
    <main className="container mx-auto px-4 py-6">
      <PageViewTracker pathname="/artists" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Artists</h1>
          <p className="text-muted-foreground">
            Discover and connect with our curated community of artists.
          </p>
        </div>
        
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <ArtistsClient initialArtists={transformedArtists} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  )
} 