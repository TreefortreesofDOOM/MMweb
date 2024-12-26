import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { approveArtistApplication, rejectArtistApplication, getArtistApplications } from "@/lib/actions"

export default async function AdminApplicationsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/sign-in')
  }

  // Verify admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return redirect('/profile')
  }

  const { applications, error } = await getArtistApplications()
  
  if (error) {
    console.error('Error fetching applications:', error)
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Artist Applications</h1>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load applications. Please try again later.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Artist Applications</h1>
      
      <div className="space-y-6">
        {applications?.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <CardTitle>Application from {application.email}</CardTitle>
              <CardDescription>
                Submitted {application.artist_application.submittedAt 
                  ? new Date(application.artist_application.submittedAt).toLocaleDateString()
                  : 'Unknown date'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Artist Statement</Label>
                <p className="mt-1 whitespace-pre-wrap">{application.artist_application.artistStatement}</p>
              </div>

              {application.artist_application.portfolioUrl && (
                <div>
                  <Label>Portfolio</Label>
                  <a
                    href={application.artist_application.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-blue-500 hover:underline"
                  >
                    {application.artist_application.portfolioUrl}
                  </a>
                </div>
              )}

              {application.artist_application.instagram && (
                <div>
                  <Label>Instagram</Label>
                  <p className="mt-1">{application.artist_application.instagram}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="space-x-2">
              <form action={approveArtistApplication}>
                <input type="hidden" name="userId" value={application.id} />
                <Button type="submit">Approve</Button>
              </form>

              <form action={rejectArtistApplication}>
                <input type="hidden" name="userId" value={application.id} />
                <Dialog>
                  <Button type="button" variant="destructive">Reject</Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Application</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for rejecting this application.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                      <Label htmlFor="rejectionReason">Rejection Reason</Label>
                      <Textarea
                        id="rejectionReason"
                        name="rejectionReason"
                        placeholder="Enter the reason for rejection..."
                        className="mt-2"
                        required
                      />
                    </div>

                    <DialogFooter>
                      <Button type="submit" variant="destructive">
                        Confirm Rejection
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </form>
            </CardFooter>
          </Card>
        ))}

        {(!applications || applications.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending applications to review.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 