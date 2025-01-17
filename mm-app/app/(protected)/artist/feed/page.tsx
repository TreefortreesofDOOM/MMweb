import { Metadata } from 'next'
import { FeedView } from '@/components/feed/feed-view'
import { getArtistProfile } from '@/lib/actions/artist/artist-actions'
import { redirect } from 'next/navigation'
import { ErrorService } from '@/lib/utils/error/error-service-utils'
import { createClient } from '@/lib/supabase/supabase-server'
import type { Database } from '@/lib/types/database.types'

const errorService = ErrorService.getInstance()

type ArtistProfile = Database['public']['Tables']['profiles']['Row']

export const metadata: Metadata = {
  title: 'Feed | Modern Masterpieces',
  description: 'Your artist community feed'
}

export default async function ArtistFeedPage(): Promise<React.ReactElement> {
  // First check if user is authenticated
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    errorService.logError({
      code: 'UI_FEED_001',
      message: 'User not authenticated for artist feed',
      context: 'ArtistFeedPage',
      type: 'info',
      timestamp: new Date().toISOString()
    })
    redirect('/login?callbackUrl=/artist/feed')
  }

  const artist: ArtistProfile | null = await getArtistProfile()
  
  if (!artist) {
    errorService.logError({
      code: 'UI_FEED_002',
      message: 'User is not an artist',
      context: 'ArtistFeedPage',
      type: 'info',
      userId: session.user.id,
      timestamp: new Date().toISOString()
    })
    // Redirect to patron feed instead of general feed to prevent loops
    redirect('/patron/feed')
  }

  errorService.logError({
    code: 'UI_FEED_003',
    message: 'Artist feed page loaded',
    context: 'ArtistFeedPage',
    type: 'debug',
    userId: artist.id,
    timestamp: new Date().toISOString(),
    metadata: {
      role: artist.role
    }
  })

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artist Feed</h1>
          <p className="text-muted-foreground">
            Stay connected with artists and followers
          </p>
        </div>
        <FeedView artistId={artist.id} />
      </div>
    </div>
  )
} 