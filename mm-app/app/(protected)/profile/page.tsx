import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProfileAction } from "@/lib/actions"
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArtistBadge } from "@/components/ui/artist-badge"
import { ExhibitionBadge } from "@/components/ui/exhibition-badge"
import { MapPin, Globe, Instagram } from "lucide-react"
import { ARTIST_ROLES } from "@/lib/types/custom-types"
import type { Database } from '@/lib/database.types'
import { VerificationBanner } from "@/components/verification-banner"
import { createActionClient } from "@/lib/supabase/action"

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { profile, error } = await getProfileAction()
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load profile. Please try again later.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return redirect('/sign-in')
  }
  
  const canApplyAsArtist = profile.role === 'user' && 
    (!profile.artist_status || profile.artist_status === 'rejected')

  const isArtist = profile.role === 'artist'
  const isVerifiedArtist = isArtist && profile.artist_type === ARTIST_ROLES.VERIFIED
  const isEmergingArtist = isArtist && profile.artist_type === ARTIST_ROLES.EMERGING
  
  // Calculate initials for avatar fallback
  const initials = profile.full_name
    ?.split(' ')
    .map((name: string) => name[0])
    .join('')
    .toUpperCase() || '';

  // Show verification banner only if email is not confirmed
  const showVerificationBanner = !user?.email_confirmed_at;
  
  return (
    <div className="container max-w-2xl mx-auto py-8">
      {showVerificationBanner && (
        <div className="mb-6">
          <VerificationBanner />
        </div>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border">
              <AvatarImage 
                src={profile.avatar_url || undefined} 
                alt={`${profile.full_name}'s profile picture`}
              />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {profile.full_name || 'Your Profile'}
                </h1>
                {isVerifiedArtist && <ArtistBadge type={ARTIST_ROLES.VERIFIED} />}
                {isEmergingArtist && <ArtistBadge type={ARTIST_ROLES.EMERGING} />}
                {profile.exhibition_badge && <ExhibitionBadge />}
              </div>
              
              {profile.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                {profile.website && (
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {profile.instagram && (
                  <a 
                    href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <Instagram className="h-4 w-4" />
                    {profile.instagram}
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isArtist && (
            <div className="rounded-md bg-primary/10 p-4">
              <p className="text-sm font-medium text-primary">
                Artist Account
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You are an approved artist on our platform. You can now upload and sell your artwork.
              </p>
            </div>
          )}

          {profile.artist_status === 'pending' && (
            <div className="rounded-md bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                Your artist application is pending review. We'll notify you once it's been processed.
              </p>
            </div>
          )}

          {profile.artist_status === 'rejected' && (
            <div className="rounded-md bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Your previous artist application was not approved. You may submit a new application.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button asChild variant="default">
              <Link href="/profile/edit">
                Edit Profile
              </Link>
            </Button>

            {canApplyAsArtist && (
              <Button asChild variant="outline">
                <Link href="/profile/application">
                  Apply as Artist
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 