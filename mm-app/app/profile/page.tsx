import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Label } from "@/components/ui/label"

export default async function ProfilePage() {
  const supabase = await createClient()
  
  // Get user and profile data
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()
	
  if (!user) {
    return redirect('/sign-in')
  }

  // Check if user can apply as artist
  const canApplyAsArtist = profile?.role === 'user' && 
    (!profile?.artist_status || profile.artist_status === 'rejected')

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      
      <div className="space-y-4">
        {profile?.role === 'artist' && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-700 font-medium">
              Artist Account
            </p>
            <p className="text-sm text-green-600 mt-1">
              You are an approved artist on our platform. You can now upload and sell your artwork.
            </p>
          </div>
        )}

        <div>
          <Label>Bio</Label>
          <p className="mt-1">{profile?.bio || 'No bio yet'}</p>
        </div>

        <div>
          <Label>Website</Label>
          <p className="mt-1">{profile?.website || 'No website added'}</p>
        </div>

        <div>
          <Label>Instagram</Label>
          <p className="mt-1">{profile?.instagram || 'No Instagram added'}</p>
        </div>

        {profile?.artist_status === 'pending' && (
          <div className="rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">
              Your artist application is pending review. We'll notify you once it's been processed.
            </p>
          </div>
        )}

        {profile?.artist_status === 'rejected' && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <p className="text-sm text-red-700">
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
              <Link href="/artist-application">
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
      </div>
    </div>
  )
} 