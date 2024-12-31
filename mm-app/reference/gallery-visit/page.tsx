import { createClient } from '@/lib/supabase/supabase-server';
import { redirect } from 'next/navigation';
import { GalleryVisitClient } from './gallery-visit-client';

interface GalleryVisitPageProps {
  params: {
    userId: string;
  };
}

export default async function GalleryVisitPage({ params }: GalleryVisitPageProps) {
  const supabase = await createClient();
  const { userId } = params;

  // Get the current user's session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login?redirect=' + encodeURIComponent('/gallery/visit/' + userId));
  }

  // Get the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600">User Not Found</h1>
        <p className="text-gray-600 mt-2">
          The user associated with this QR code could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <GalleryVisitClient
        userId={userId}
        profile={profile}
        currentUser={session.user}
      />
    </div>
  );
} 