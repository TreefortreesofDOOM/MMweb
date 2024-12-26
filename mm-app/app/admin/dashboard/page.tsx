import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAdminStats } from '@/lib/actions';

export default async function AdminDashboardPage() {
  const { stats, error } = await getAdminStats();

  if (error) {
    console.error('Error fetching admin stats:', error);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Overview</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
            <Button variant="link" className="px-0" asChild>
              <Link href="/admin/applications">
                Review Applications →
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Artists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalArtists || 0}</div>
            <Button variant="link" className="px-0" asChild>
              <Link href="/admin/artists">
                Manage Artists →
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Artworks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalArtworks || 0}</div>
            <Button variant="link" className="px-0" asChild>
              <Link href="/admin/artworks">
                View Artworks →
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-muted-foreground">
            <p>• User Management</p>
            <p>• Artwork Approval Queue</p>
            <p>• Analytics & Metrics</p>
            <p>• Platform Settings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 