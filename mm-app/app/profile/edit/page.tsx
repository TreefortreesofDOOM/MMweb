import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateProfileAction } from '@/app/actions'
import { FormMessage, Message } from "@/components/form-message"
import Link from "next/link"

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<Message>;
}) {
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

  // Await searchParams
  const params = await searchParams;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      
      <form action={updateProfileAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile?.bio || ''}
            placeholder="Tell us about yourself"
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
    </div>
  )
} 