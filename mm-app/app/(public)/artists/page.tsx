import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ArtistsClient } from './artists-client'
import Loading from './loading'
import { ErrorBoundary } from './error-boundary'
import { ARTIST_ROLES, type ArtistRole } from '@/lib/types/custom-types'
import type { Metadata } from 'next'
import type { ArtistWithCount } from './artists-client'

export const metadata: Metadata = {
  title: 'Artists | Meaning Machine',
  description: 'Browse our curated artists.',
}

export default async function ArtistsPage(): Promise<React.ReactElement> {
  const supabase = await createClient()

  // Fetch initial artists data
  const { data: initialArtists, error } = await supabase
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
      artist_type,
      location,
      artworks:artworks(count)
    `)
    .in('artist_type', [ARTIST_ROLES.VERIFIED, ARTIST_ROLES.EMERGING])
    .order('exhibition_badge', { ascending: false, nullsFirst: false })
    .order('artist_type', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(0, 11)

  // Debug logs
  console.log('Query error:', error)
  console.log('Found artists:', initialArtists?.length)
  console.log('Artist types:', initialArtists?.map(a => ({ id: a.id, type: a.artist_type })))

  // Transform the data to match ArtistWithCount type
  const transformedArtists = initialArtists?.map(artist => ({
    ...artist,
    artist_type: artist.artist_type as ArtistRole,
    artworks: [{ count: artist.artworks?.[0]?.count || 0 }] as [{ count: number }]
  })) as ArtistWithCount[]

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Artists</h1>
          <p className="text-muted-foreground">
            Discover and connect with our curated community of artists.
          </p>
        </div>
        
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <ArtistsClient initialArtists={transformedArtists || []} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  )
} 