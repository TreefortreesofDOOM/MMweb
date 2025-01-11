import { AnalyticsDashboard } from '@/components/analytics/dashboard';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getAdminStats } from '@/lib/actions/admin/admin-actions';
import { createClient } from '@/lib/supabase/supabase-server';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's profile to check if they're an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Only admins can access this page
  if (profile?.role !== 'admin') {
    redirect('/');
  }

  const { stats, error } = await getAdminStats();

  if (error) {
    console.error('Error fetching admin stats:', error);
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Overview</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Featured Artist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage</div>
            <Button variant="link" className="px-0" asChild>
              <Link href="/featured-artist">
                Set Featured Artist →
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
            <Button variant="link" className="px-0" asChild>
              <Link href="/applications">
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
              <Link href="/artists">
                Manage Artists →
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dashboard */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Analytics & Metrics</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Platform-wide analytics and performance metrics
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/analytics">
              View Full Analytics →
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <AnalyticsDashboard />
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-muted-foreground">
            <p>• User Management</p>
            <p>• Artwork Approval Queue</p>
            <p>• Platform Settings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 