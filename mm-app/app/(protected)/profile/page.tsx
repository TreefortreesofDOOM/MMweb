import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { getProfileAction } from "@/lib/actions"
import { redirect } from 'next/navigation'
import { ARTIST_ROLES } from "@/lib/types/custom-types"
import type { Database } from '@/lib/database.types'
import { VerificationBanner } from "@/components/verification-banner"
import { createActionClient } from "@/lib/supabase/action"
import { ArtistProfileCard } from "@/components/artist/artist-profile-card"

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
      <div className="container max-w-7xl mx-auto py-8">
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

  // Show verification banner only if email is not confirmed
  const showVerificationBanner = !user?.email_confirmed_at;

  // Transform profile to match ArtistProfileCard interface
  const artistProfile = {
    id: profile.id,
    full_name: profile.full_name || 'Your Profile',
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    website: profile.website,
    instagram: profile.instagram,
    location: profile.location,
    artist_type: (profile.role === 'verified_artist' ? ARTIST_ROLES.VERIFIED : ARTIST_ROLES.EMERGING),
    medium: profile.medium || []
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-8">
      {showVerificationBanner && (
        <div className="mb-6">
          <VerificationBanner />
        </div>
      )}
      
      <div className="space-y-6">
        <ArtistProfileCard 
          artist={artistProfile} 
          showFollow={false}
          showBadge={isArtist}
        />

        {isArtist && (
          <Card>
            <CardContent className="py-6">
              <div className="rounded-md bg-primary/10 p-4">
                <p className="text-sm font-medium text-primary">
                  Artist Account
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You are an approved artist on our platform. You can now upload and sell your artwork.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {profile.artist_status === 'pending' && (
          <Card>
            <CardContent className="py-6">
              <div className="rounded-md bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  Your artist application is pending review. We'll notify you once it's been processed.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {profile.artist_status === 'rejected' && (
          <Card>
            <CardContent className="py-6">
              <div className="rounded-md bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  Your previous artist application was not approved. You may submit a new application.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="py-6">
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
    </div>
  )
} 