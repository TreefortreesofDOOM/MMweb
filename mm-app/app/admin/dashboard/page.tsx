import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">Pending Applications</h3>
          <p className="text-3xl font-bold">{pendingApplications || 0}</p>
          <Link 
            href="/admin/applications" 
            className="text-blue-500 hover:text-blue-700 text-sm mt-2 block"
          >
            Review Applications →
          </Link>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">Total Artists</h3>
          <p className="text-3xl font-bold">{totalArtists || 0}</p>
          <Link 
            href="/admin/artists" 
            className="text-blue-500 hover:text-blue-700 text-sm mt-2 block"
          >
            Manage Artists →
          </Link>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-2">Platform Status</h3>
          <p className="text-sm text-green-600 font-semibold">All Systems Operational</p>
        </Card>
      </div>

      {/* Coming Soon */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Coming Soon</h2>
        <div className="space-y-2 text-gray-500">
          <p>• User Management</p>
          <p>• Artwork Approval Queue</p>
          <p>• Analytics & Metrics</p>
          <p>• Platform Settings</p>
        </div>
      </div>
    </div>
  );
} 