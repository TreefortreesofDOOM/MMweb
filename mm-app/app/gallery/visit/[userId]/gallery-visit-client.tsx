'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/lib/database.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GalleryVisitClientProps {
  userId: string;
  profile: Tables<'profiles'>;
  currentUser: User;
}

export function GalleryVisitClient({
  userId,
  profile,
  currentUser,
}: GalleryVisitClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVisit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/gallery/visit/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to record gallery visit');
      }

      toast({
        title: 'Success',
        description: 'Gallery visit recorded successfully',
      });
    } catch (error) {
      console.error('Error recording gallery visit:', error);
      toast({
        title: 'Error',
        description: 'Failed to record gallery visit',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallery Visit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={profile.avatar_url || undefined}
              alt={profile.full_name || 'User'}
            />
            <AvatarFallback>
              {profile.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {profile.full_name}
            </h2>
            {profile.role === 'artist' && (
              <p className="text-sm text-muted-foreground mt-1">Artist</p>
            )}
          </div>

          <Button
            onClick={handleVisit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Recording Visit...' : 'Record Gallery Visit'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            This will record your visit to the gallery and help us provide
            a better experience for future visits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 