import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateProfileAction, getProfileAction } from "@/lib/actions"
import { FormMessage, Message } from "@/components/form-message"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ProfileAvatarForm } from '@/components/profile/profile-avatar-form'
import { ProfileMediumForm } from '@/components/profile/profile-medium-form'
import type { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<Message>;
}) {
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

  if (!profile) {
    return redirect('/sign-in')
  }
  
  const params = await searchParams;
  const isArtist = profile.role === 'artist';
  const isVerifiedArtist = isArtist && profile.artist_type === 'verified';
  const isEmergingArtist = isArtist && profile.artist_type === 'emerging';
  const verificationProgress = profile.verification_progress || 0;
  
  // Calculate initials for avatar
  const initials = profile.full_name
    ?.split(' ')
    .map((name: string) => name[0])
    .join('')
    .toUpperCase() || ''
  
  return (
    <div className="container max-w-2xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
            {isVerifiedArtist ? (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified Artist
              </Badge>
            ) : isEmergingArtist ? (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Emerging Artist
              </Badge>
            ) : null}
          </div>
          {isEmergingArtist && (
            <CardDescription>
              Complete your profile to increase your verification progress.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show form message if exists */}
          {params && (
            <FormMessage message={params} />
          )}

          {/* Avatar Upload Section */}
          <ProfileAvatarForm 
            currentAvatarUrl={profile?.avatar_url} 
            initials={initials}
          />

          <form action={updateProfileAction} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={profile?.first_name || ''}
                  placeholder="Your first name"
                  required={isArtist}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={profile?.last_name || ''}
                  placeholder="Your last name"
                  required={isArtist}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio || ''}
                placeholder="Tell us about yourself"
                required={isArtist}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={profile?.location || ''}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={profile?.website || ''}
                placeholder="https://your-website.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                defaultValue={profile?.instagram || ''}
                placeholder="@your.instagram"
              />
            </div>

            {/* Add Medium Selection */}
            <ProfileMediumForm
              initialMediums={profile?.medium || []}
              isArtist={isArtist}
            />

            <div className="flex justify-end gap-4">
              <Button asChild variant="outline">
                <Link href="/profile">Cancel</Link>
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 