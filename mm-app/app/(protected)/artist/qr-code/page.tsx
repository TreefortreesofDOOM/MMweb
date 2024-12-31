import { createClient } from '@/lib/supabase/supabase-server';
import { UserQR } from '@/components/profile/user-qr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function ArtistQRPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Gallery QR Code</CardTitle>
          <CardDescription>
            Display this QR code in your physical gallery or at events for visitors to scan and view your digital portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <UserQR userId={user.id} username={profile?.name || 'Artist'} />
        </CardContent>
      </Card>
    </div>
  );
} 