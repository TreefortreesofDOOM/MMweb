import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/sign-in');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return redirect('/profile');
  }

  // Get counts for overview
  const { count: pendingApplications } = await supabase
    .from('artist_applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: totalArtists } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'artist');

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
            <div className="text-2xl font-bold">{pendingApplications || 0}</div>
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
            <div className="text-2xl font-bold">{totalArtists || 0}</div>
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
              Platform Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-primary">
              All Systems Operational
            </div>
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