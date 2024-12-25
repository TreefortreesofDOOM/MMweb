import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplicationReview } from "@/components/admin/application-review"

interface Application {
  id: string
  email: string
  artist_application: {
    artistStatement: string
    portfolioUrl?: string
    instagram?: string
  }
  artist_status: string
  created_at: string
  updated_at: string
}

interface ApplicationListProps {
  applications: Application[]
}

export function ApplicationList({ applications }: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No pending applications to review.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader>
            <CardTitle>Application from {application.email}</CardTitle>
            <CardDescription>
              Submitted {new Date(application.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationReview application={application} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 