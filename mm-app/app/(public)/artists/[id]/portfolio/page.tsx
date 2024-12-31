import { createClient } from '@/lib/supabase/supabase-server'
import { notFound } from 'next/navigation'
import { PortfolioClient } from './portfolio-client'
import { Card, CardContent } from "@/components/ui/card"
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { ARTIST_ROLES, type ArtistRole } from '@/lib/types/custom-types'
import { ArtistProfileCard } from '@/components/artist/artist-profile-card'
import { ErrorBoundary } from '../../error-boundary'
import { Suspense } from 'react'
import Loading from './loading'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }> | { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio')
    .eq('id', id)
    .single()

  if (!profile) return {
    title: 'Portfolio Not Found | Meaning Machine',
    description: 'The requested artist portfolio could not be found.'
  }

  return {
    title: `${profile.full_name}'s Portfolio | Meaning Machine`,
    description: profile.bio || `View ${profile.full_name}'s curated portfolio on Meaning Machine.`
  }
}

export default async function PortfolioPage({ params }: PageProps) {
  const supabase = await createClient()
  
  try {
    console.log('Portfolio page params:', params)
    const { id } = await params
    console.log('Resolved artist ID:', id)
    
    // First check if profile exists at all
    const { data: basicProfile, error: basicProfileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', id)
      .single()

    if (basicProfileError) {
      console.error('Error fetching basic profile:', basicProfileError)
      notFound()
    }

    if (!basicProfile) {
      console.log('No profile found for artist:', id)
      notFound()
    }

    console.log('Found basic profile:', {
      id: basicProfile.id,
      role: basicProfile.role
    })

    // Check if user has artist role
    if (!basicProfile.role || !['verified_artist', 'emerging_artist'].includes(basicProfile.role)) {
      console.log('Profile is not an artist:', {
        role: basicProfile.role
      })
      notFound()
    }
    
    // Fetch artist profile with all required fields
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        avatar_url,
        bio,
        website,
        instagram,
        location,
        role,
        medium
      `)
      .eq('id', id)
      .single()

    if (profileError) {
      console.error('Error fetching artist profile:', profileError)
      notFound()
    }

    if (!profile) {
      console.log('No profile found for artist:', id)
      notFound()
    }

    // Map role to artist_type for the ArtistProfileCard
    const artistProfile = {
      ...profile,
      artist_type: (profile.role === 'verified_artist' ? 'verified' : 'emerging') as ArtistRole,
      medium: profile.medium || []
    }

    console.log('Found artist profile:', {
      id: profile.id,
      role: profile.role,
      artist_type: artistProfile.artist_type
    })

    // Fetch artist's published artworks with custom ordering
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select(`
        *,
        profiles (
          id,
          full_name,
          bio
        )
      `)
      .eq('artist_id', id)
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (artworksError) {
      console.error('Error fetching artworks:', artworksError)
    }

    // If no artworks found, show empty state
    if (!artworks?.length) {
      console.log('No published artworks found for artist:', id)
      return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <PageViewTracker pathname={`/artists/${id}/portfolio`} />
          <div className="space-y-8">
            <ArtistProfileCard 
              artist={artistProfile}
              isPublicRoute={true}
            />
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  This artist hasn't published any artworks yet.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    console.log('Found published artworks:', artworks.length)

    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <PageViewTracker pathname={`/artists/${id}/portfolio`} />
        <div className="space-y-8">
          <ArtistProfileCard 
            artist={artistProfile}
            isPublicRoute={true}
          />
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <PortfolioClient 
                artistId={id} 
                initialArtworks={artworks}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Unexpected error in portfolio page:', error)
    notFound()
  }
} 