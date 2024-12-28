'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setFeaturedArtist, removeFeaturedArtist } from '@/lib/actions/featured-artist';
import { toast } from 'sonner';

interface Artist {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
}

interface FeaturedArtistManagerProps {
  currentFeaturedArtist: Artist | null;
  verifiedArtists: Artist[];
}

export function FeaturedArtistManager({ currentFeaturedArtist, verifiedArtists }: FeaturedArtistManagerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSetFeaturedArtist = async (artistId: string) => {
    setIsLoading(true);
    try {
      const result = await setFeaturedArtist(artistId);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Featured artist updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update featured artist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFeaturedArtist = async () => {
    setIsLoading(true);
    try {
      const result = await removeFeaturedArtist();
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Featured artist removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove featured artist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {currentFeaturedArtist && (
        <Card>
          <CardHeader>
            <CardTitle>Current Featured Artist</CardTitle>
            <CardDescription>This artist is currently featured on the homepage</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentFeaturedArtist.avatar_url || ''} alt={currentFeaturedArtist.name} />
              <AvatarFallback>{currentFeaturedArtist.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{currentFeaturedArtist.name}</h3>
              <p className="text-sm text-muted-foreground">{currentFeaturedArtist.bio || 'No bio available'}</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleRemoveFeaturedArtist}
              disabled={isLoading}
            >
              Remove
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Set Featured Artist</CardTitle>
          <CardDescription>Select an artist to feature on the homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            onValueChange={handleSetFeaturedArtist}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an artist" />
            </SelectTrigger>
            <SelectContent>
              {verifiedArtists.map((artist) => (
                <SelectItem 
                  key={artist.id} 
                  value={artist.id}
                >
                  {artist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
} 