import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import type { FeedItem as FeedItemType } from '@/lib/types/feed/feed-types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export interface FeedItemProps {
  item: FeedItemType
}

export function FeedItem({ item }: FeedItemProps) {
  const { content, creator, timestamp, isSystemContent } = item
  const imageUrl = Array.isArray(content.images) && content.images.length > 0 
    ? String(content.images[0])
    : '/placeholder-artwork.jpg' // Fallback image

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      ;(event.currentTarget as HTMLElement).click()
    }
  }

  return (
    <Card className={cn(isSystemContent && "border-primary/20 bg-primary/5")}>
      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-4">
          <Link 
            href={`/artist/${creator.id}`} 
            className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={`View ${creator.name}'s profile`}
          >
            <Avatar className={cn(isSystemContent && "ring-2 ring-primary ring-offset-2")}>
              <AvatarImage src={creator.avatar_url ?? undefined} alt={creator.name ?? 'Artist'} />
              <AvatarFallback>{creator.name?.[0] ?? 'A'}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Link 
                href={`/artist/${creator.id}`}
                className="font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                aria-label={`View ${creator.name}'s profile`}
              >
                {creator.name}
              </Link>
              {isSystemContent && (
                <Badge variant="outline" className="h-2 w-2 rounded-full border-primary bg-primary p-0" aria-label="AI Content" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link 
          href={`/artwork/${content.id}`} 
          className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label={`View artwork: ${content.title}`}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={imageUrl}
              alt={content.title ?? 'Artwork'}
              fill
              className="object-contain"
              sizes="(min-width: 1280px) 36rem, (min-width: 1024px) 32rem, (min-width: 768px) 24rem, 100vw"
              priority={true}
              quality={90}
            />
          </div>
        </Link>
        <div>
          <Link 
            href={`/artwork/${content.id}`}
            className="text-lg font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label={`View artwork: ${content.title}`}
          >
            {content.title}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 