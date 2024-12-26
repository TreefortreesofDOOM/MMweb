import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateProfileAction, getProfileAction } from "@/lib/actions"
import { FormMessage, Message } from "@/components/form-message"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile?.name || ''}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio || ''}
                placeholder="Tell us about yourself"
                className="min-h-[100px]"
              />
            </div>
    
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={profile?.website || ''}
                placeholder="https://example.com"
              />
            </div>
    
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                defaultValue={profile?.instagram || ''}
                placeholder="@username"
              />
            </div>
    
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