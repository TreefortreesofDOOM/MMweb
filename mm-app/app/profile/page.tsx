import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProfileAction } from "@/lib/actions"

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/sign-in')
  }

  const { profile, error } = await getProfileAction()
  
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
  
  const canApplyAsArtist = profile?.role === 'user' && 
    (!profile?.artist_status || profile.artist_status === 'rejected')
  
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile?.role === 'artist' && (
            <div className="rounded-md bg-primary/10 p-4">
              <p className="text-sm font-medium text-primary">
                Artist Account
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You are an approved artist on our platform. You can now upload and sell your artwork.
              </p>
            </div>
          )}
  
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
            <p className="text-sm">
              {profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : profile?.first_name || profile?.last_name || 'No name added'}
            </p>
          </div>
  
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
            <p className="text-sm">{profile?.bio || 'No bio yet'}</p>
          </div>
  
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
            <p className="text-sm">{profile?.website || 'No website added'}</p>
          </div>
  
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Instagram</h3>
            <p className="text-sm">{profile?.instagram || 'No Instagram added'}</p>
          </div>
  
          {profile?.artist_status === 'pending' && (
            <div className="rounded-md bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                Your artist application is pending review. We'll notify you once it's been processed.
              </p>
            </div>
          )}
  
          {profile?.artist_status === 'rejected' && (
            <div className="rounded-md bg-destructive/10 p-4 mb-4">
              <p className="text-sm text-destructive">
                Your previous artist application was not approved. You may submit a new application.
              </p>
            </div>
          )}
  
          <div className="flex flex-col gap-2">
            <Button asChild variant="default">
              <Link href="/profile/edit">
                {profile ? 'Edit Profile' : 'Create Profile'}
              </Link>
            </Button>
  
            {canApplyAsArtist && (
              <Button asChild variant="outline">
                <Link href="/profile/application">
                  Apply as Artist
                </Link>
              </Button>
            )}
  
            {profile?.role === 'artist' && (
              <Button asChild variant="outline">
                <Link href="/artist/dashboard">
                  Artist Dashboard
                </Link>
              </Button>
            )}
          </div>
  
          {profile?.role === 'admin' && (
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link href="/admin/dashboard">
                    Admin Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 