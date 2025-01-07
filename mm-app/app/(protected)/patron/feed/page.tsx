import { Metadata } from 'next'
import { FeedView } from '@/components/feed/feed-view'
import { getPatronProfile } from '@/lib/actions/patron/patron-actions'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Feed | Modern Masterpieces',
  description: 'Your personalized patron art feed'
}

export default async function PatronFeedPage() {
  const patron = await getPatronProfile()
  
  if (!patron) {
    redirect('/feed')
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patron Feed</h1>
          <p className="text-muted-foreground">
            Stay updated with artworks and activities from your followed artists
          </p>
        </div>
        <FeedView patronId={patron.id} />
      </div>
    </div>
  )
} 