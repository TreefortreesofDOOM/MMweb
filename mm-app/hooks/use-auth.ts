'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import { 
  ARTIST_ROLES, 
  type ArtistProfile, 
  type ArtistFeatures, 
  type VerificationRequirements,
  type ArtistRole,
  type Profile 
} from '@/lib/types/custom-types';

export interface AuthState {
  user: User | null;
  profile: ArtistProfile | null;
  isLoading: boolean;
  error: string | null;
  isArtist: boolean;
  isVerifiedArtist: boolean;
  isEmergingArtist: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  const fetchProfile = async (userId: string) => {
    try {
      const { data: dbProfile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          artworks: artworks_aggregate (
            count
          )
        `)
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw profileError;
      }

      if (!dbProfile) {
        throw new Error('Profile not found');
      }

      // Convert database profile to ArtistProfile type
      const artistProfile: ArtistProfile = {
        ...dbProfile,
        artist_type: dbProfile.artist_type as ArtistRole,
        features: null, // This will be computed by the useArtist hook
        verificationProgress: null // This will be computed by the useVerification hook
      };

      return artistProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Get initial session and profile
    const initAuth = async () => {
      try {
        setError(null);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize auth');
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setError(null);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error updating auth state:', error);
        setError(error instanceof Error ? error.message : 'Failed to update auth state');
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const isVerifiedArtist = profile?.artist_type === ARTIST_ROLES.VERIFIED;
  const isEmergingArtist = profile?.artist_type === ARTIST_ROLES.EMERGING;
  const isArtist = isVerifiedArtist || isEmergingArtist;

  return {
    user,
    profile,
    isLoading,
    error,
    isArtist,
    isVerifiedArtist,
    isEmergingArtist,
  };
} 