import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/supabase-server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminCalendar } from '@/components/gallery/calendar/admin-calendar';
import { ShowApprovalList } from '@/components/gallery/show-approval-list';

export default async function AdminGalleryPage() {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gallery Administration</h1>
        <p className="text-muted-foreground">
          Manage gallery calendar and show approvals.
        </p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="shows">Show Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Gallery Calendar</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage available dates for gallery shows
                    </p>
                  </div>
                </div>
                <AdminCalendar />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Shows</CardTitle>
            </CardHeader>
            <CardContent>
              <ShowApprovalList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 