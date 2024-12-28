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
  
  const params = await searchParams;
  const isArtist = profile?.role === 'artist';
  const isVerifiedArtist = isArtist && profile?.artist_type === 'verified';
  const isEmergingArtist = isArtist && profile?.artist_type === 'emerging';
  const verificationProgress = profile?.verification_progress || 0;
  
  return (
    <div className="container max-w-2xl mx-auto py-8">
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
        <CardContent>
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
                className="min-h-[100px]"
                required={isArtist}
              />
              {isArtist && (
                <p className="text-sm text-muted-foreground">
                  A detailed bio helps collectors understand your artistic journey.
                  {isEmergingArtist && " This is required for verification."}
                </p>
              )}
            </div>
    
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={profile?.website || ''}
                placeholder="https://example.com"
                required={isVerifiedArtist}
              />
              {isArtist && (
                <p className="text-sm text-muted-foreground">
                  Your professional website or portfolio.
                  {isVerifiedArtist && " Required for verified artists."}
                </p>
              )}
            </div>
    
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                defaultValue={profile?.instagram || ''}
                placeholder="@username"
                required={isVerifiedArtist}
              />
              {isArtist && (
                <p className="text-sm text-muted-foreground">
                  Your Instagram handle for social presence.
                  {isVerifiedArtist && " Required for verified artists."}
                </p>
              )}
            </div>

            {isEmergingArtist && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-3">
                  <p>Complete your profile to progress towards verification.</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Verification Progress</span>
                      <span>{verificationProgress}%</span>
                    </div>
                    <Progress value={verificationProgress} className="h-2" />
                  </div>
                  <Link 
                    href="/artist/verification" 
                    className="text-primary hover:underline block text-sm mt-2"
                  >
                    View verification requirements
                  </Link>
                </AlertDescription>
              </Alert>
            )}
    
            <div className="flex gap-4">
              <Button type="submit">
                Save Changes
              </Button>
              <Button asChild variant="outline">
                <Link href="/profile">
                  Cancel
                </Link>
              </Button>
            </div>
            
            <FormMessage message={params} />
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 