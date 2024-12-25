"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { approveArtistApplication, rejectArtistApplication } from "@/app/actions"

interface Application {
  id: string
  email: string
  artist_application: {
    artistStatement: string
    portfolioUrl?: string
    instagram?: string
  }
}

interface ApplicationReviewProps {
  application: Application
}

export function ApplicationReview({ application }: ApplicationReviewProps) {
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const handleApprove = () => {
    const formData = new FormData()
    formData.append("userId", application.id)
    approveArtistApplication(formData)
  }

  const handleReject = () => {
    const formData = new FormData()
    formData.append("userId", application.id)
    formData.append("rejectionReason", rejectionReason)
    rejectArtistApplication(formData)
    setRejectionDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Artist Statement</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {application.artist_application.artistStatement}
        </p>
      </div>

      {application.artist_application.portfolioUrl && (
        <div>
          <h3 className="font-semibold mb-2">Portfolio</h3>
          <a
            href={application.artist_application.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            {application.artist_application.portfolioUrl}
          </a>
        </div>
      )}

      {application.artist_application.instagram && (
        <div>
          <h3 className="font-semibold mb-2">Instagram</h3>
          <p className="text-sm text-muted-foreground">
            {application.artist_application.instagram}
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={handleApprove}>
          Approve
        </Button>
        <Button variant="destructive" onClick={() => setRejectionDialogOpen(true)}>
          Reject
        </Button>
      </div>

      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application.
              This will be included in the email sent to the applicant.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 