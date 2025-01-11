'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/supabase-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { CheckCircle2, Clock, XCircle, Pencil } from 'lucide-react';
import { GalleryShowForm } from '@/components/gallery/show-form';
import type { GalleryShowWithDetails } from '@/lib/types/gallery-types';

type ArtworkImage = { url: string; isPrimary?: boolean; order?: number };

export default function GalleryShowsPage() {
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get('status') === 'success';
  const [editingShow, setEditingShow] = useState<GalleryShowWithDetails | null>(null);

  const { data: shows, isLoading, error, refetch } = useQuery({
    queryKey: ['gallery-shows'],
    queryFn: async () => {
      const supabase = createBrowserClient();
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }
      
      console.log('Current user:', user.id);
      
      const { data, error } = await supabase
        .from('gallery_shows')
        .select(`
          *,
          created_by_profile:profiles!gallery_shows_created_by_fkey(*),
          artworks:gallery_show_artworks(
            artwork:artworks(*)
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      console.log('Query result:', { data, error });
      
      if (error) {
        throw error;
      }
      
      return data as GalleryShowWithDetails[];
    }
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load gallery shows. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-4 h-4 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-4 h-4 mr-1" /> Pending Approval</Badge>;
    }
  };

  const handleEditComplete = () => {
    setEditingShow(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert>
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your gallery show has been submitted for approval. Our team will review it shortly.
            You can track the status of your show below.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Your Gallery Shows</h1>
          <Button onClick={() => setEditingShow({} as GalleryShowWithDetails)}>
            Create Show
          </Button>
        </div>
        <p className="text-muted-foreground">
          View and manage your gallery show submissions.
        </p>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading your shows...</div>
      ) : !shows?.length ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              You haven&apos;t created any gallery shows yet.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {shows.map((show) => (
            <Card key={show.id}>
              <CardHeader className="p-6">
                <div className="flex gap-6">
                  {show.artworks?.[0]?.artwork && (
                    <div className="w-40 h-40 flex-shrink-0">
                      <div className="aspect-square relative rounded-md overflow-hidden">
                        <img
                          src={Array.isArray(show.artworks[0].artwork.images) 
                            ? (show.artworks[0].artwork.images as ArtworkImage[])[0]?.url 
                            : (show.artworks[0].artwork.images as any)?.main}
                          alt={show.artworks[0].artwork.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{show.title}</CardTitle>
                      <div className="text-sm font-medium">
                        By {show.created_by_profile?.name || 'Unknown Artist'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @Meaning Machine
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(show.start_date), 'MMM d, yyyy')} - {format(new Date(show.end_date), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {show.artworks?.length} {show.artworks?.length === 1 ? 'artwork' : 'artworks'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {show.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingShow(show)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      {getStatusBadge(show.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingShow} onOpenChange={() => setEditingShow(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Gallery Show</DialogTitle>
          </DialogHeader>
          {editingShow && (
            <GalleryShowForm
              show={editingShow}
              onSuccess={handleEditComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 