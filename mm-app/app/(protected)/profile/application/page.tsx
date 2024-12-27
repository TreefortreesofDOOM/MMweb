import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { submitArtistApplication } from "@/lib/actions"
import { FormMessage, Message } from "@/components/form-message"
import Link from "next/link"

export default async function ArtistApplicationPage({
  searchParams,
}: {
  searchParams: Promise<Message>;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  // Get existing application if any
  const { data: profile } = await supabase
    .from('profiles')
    .select('artist_application, artist_status')
    .eq('id', user.id)
    .single()

  // If already an artist or application is pending/approved, redirect to profile
  if (profile?.artist_status && profile.artist_status !== 'draft') {
    return redirect('/profile')
  }

  // Await searchParams
  const params = await searchParams;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Artist Application</h1>
        <p className="text-muted-foreground">
          Apply to become an artist on our platform. Tell us about your art and creative journey.
        </p>
      </div>

      <form action={submitArtistApplication} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="artistStatement">Artist Statement</Label>
          <Textarea
            id="artistStatement"
            name="artistStatement"
            defaultValue={profile?.artist_application?.artistStatement || ''}
            placeholder="Tell us about your art, your inspiration, and your creative journey..."
            className="min-h-[200px]"
            required
            minLength={100}
            maxLength={1000}
          />
          <p className="text-sm text-muted-foreground">
            This will help us understand your artistic vision and goals. Minimum 100 characters.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolioUrl">Portfolio URL</Label>
          <Input
            id="portfolioUrl"
            name="portfolioUrl"
            type="url"
            defaultValue={profile?.artist_application?.portfolioUrl || ''}
            placeholder="https://your-portfolio.com"
          />
          <p className="text-sm text-muted-foreground">
            Link to your existing portfolio or gallery (optional).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram Handle</Label>
          <Input
            id="instagram"
            name="instagram"
            defaultValue={profile?.artist_application?.instagram || ''}
            placeholder="@yourusername"
          />
          <p className="text-sm text-muted-foreground">
            Your Instagram handle (optional).
          </p>
        </div>

        <div className="flex items-start space-x-3">
          <input 
            type="checkbox" 
            id="termsAccepted"
            name="termsAccepted"
            value="true"
            required
            className="mt-1"
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="termsAccepted">
              I accept the terms and conditions
            </Label>
            <p className="text-sm text-muted-foreground">
              By submitting this application, you agree to our artist terms and conditions.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">
            Submit Application
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