import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/types/database.types'
import { VerificationBanner } from "@/components/verification/verification-banner"
import { createActionClient } from "@/lib/supabase/supabase-action-utils"
import { ArtistProfileCard } from "@/components/artist/artist-profile-card"
import { getGhostProfileByEmail } from "@/lib/actions/ghost-profiles"
import { GhostProfileNotification } from "@/components/ghost-profiles/ghost-profile-notification"
import { isAnyArtist } from "@/lib/utils/role-utils"

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function ProfilePage() {
  const supabase = await createActionClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/sign-in')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    redirect('/sign-in')
  }

  // Check for ghost profile
  let ghostProfile = null
  try {
    ghostProfile = await getGhostProfileByEmail(session.user.email!)
  } catch (error) {
    console.error('Error checking ghost profile:', error)
  }

  // Only show ghost profile data if it exists and is already claimed by this user
  if (ghostProfile && ghostProfile.claimedProfileId === session.user.id) {
    try {
      // Update profile with ghost data if not already done
      if (!profile.ghost_profile_claimed) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            total_purchases: ghostProfile.totalPurchases,
            total_spent: ghostProfile.totalSpent,
            ghost_profile_claimed: true,
            last_purchase_date: ghostProfile.lastPurchaseDate,
          })
          .eq('id', session.user.id)

        if (profileError) {
          console.error('Error updating profile with ghost data:', profileError)
        }
      }
    } catch (error) {
      console.error('Error updating profile with ghost data:', error)
    }
  }

  const isArtist = isAnyArtist(profile.role)

  // Transform profile to match ArtistProfileCard interface
  const artistProfile = {
    id: profile.id,
    full_name: profile.full_name || 'Your Profile',
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    website: profile.website,
    instagram: profile.instagram,
    location: profile.location,
    role: profile.role,
    medium: profile.medium || []
  }

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      {!profile.email_verified && <VerificationBanner />}

      {ghostProfile && !profile.ghost_profile_claimed && (
        <GhostProfileNotification ghostProfile={ghostProfile} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings
          </p>
        </div>
        <Button asChild>
          <Link href="/profile/edit">Edit Profile</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {isArtist ? (
          <ArtistProfileCard 
            artist={artistProfile} 
            showFollow={false}
            showBadge={true}
          />
        ) : (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Account Information</h2>
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Display Name</p>
                      <p>{profile.display_name || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Purchases</p>
                      <p>{profile.total_purchases || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p>{profile.total_spent ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(profile.total_spent / 100) : '$0.00'}</p>
                    </div>
                  </div>
                  {profile.last_purchase_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Last Purchase</p>
                      <p>{new Date(profile.last_purchase_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 