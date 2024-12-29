import { createClient } from '@/lib/supabase/server';
import { AnalyticsDashboard } from '@/components/analytics/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function ArtistAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get artist's profile to check if they're verified
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Only verified artists can access analytics
  if (profile?.role !== 'verified_artist') {
    redirect('/artist/dashboard');
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your performance and visitor engagement
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsDashboard artistId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
} 