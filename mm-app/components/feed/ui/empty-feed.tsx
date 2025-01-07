import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

interface EmptyFeedProps {
  isPatron?: boolean
}

export function EmptyFeed({ isPatron }: EmptyFeedProps) {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-muted">
            <Users className="h-6 w-6" />
          </div>
        </div>
        <CardTitle>Your Feed is Empty</CardTitle>
        <CardDescription>
          {isPatron ? (
            "You're not following any artists yet. Follow some artists to see their latest artworks and updates in your feed."
          ) : (
            "Your feed is empty. Follow artists to see their latest artworks and updates."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/artists">
              Discover Artists
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 