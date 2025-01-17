import { Metadata } from 'next'
import { FeedView } from '@/components/feed/feed-view'
import { createClient } from '@/lib/supabase/supabase-server'
import { redirect } from 'next/navigation'
import { ErrorService } from '@/lib/utils/error/error-service-utils'

const errorService = ErrorService.getInstance()

export const metadata: Metadata = {
  title: 'Feed | Modern Masterpieces',
  description: 'Your personalized art feed'
}

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    errorService.logError({
      code: 'UI_FEED_001',
      message: 'No session found for feed page',
      context: 'FeedPage',
      type: 'auth',
      timestamp: new Date().toISOString()
    })
    redirect('/login?callbackUrl=/feed')
  }

  // Get user's role to determine if they're an artist or patron
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isArtist = profile?.role === 'verified_artist' || profile?.role === 'emerging_artist'

  errorService.logError({
    code: 'UI_FEED_002',
    message: 'Feed page loaded',
    context: 'FeedPage',
    type: 'debug',
    userId: session.user.id,
    timestamp: new Date().toISOString(),
    metadata: {
      role: profile?.role,
      isArtist
    }
  })

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest artworks and activities
          </p>
        </div>
        <FeedView 
          patronId={!isArtist ? session.user.id : undefined}
          artistId={isArtist ? session.user.id : undefined}
        />
      </div>
    </div>
  )
} 