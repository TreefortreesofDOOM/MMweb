'use client';

import { createBrowserClient } from '@/lib/supabase/supabase-client';
import { useEffect, useState } from 'react';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database.types';
import { 
  type Profile,
  type ArtistProfile,
  type ArtistFeatures,
  type VerificationRequirements,
  isVerifiedArtist,
  isEmergingArtist,
  isAnyArtist,
  isAdmin,
  isPatron
} from '@/lib/types/custom-types';

export interface AuthState {
  user: User | null;
  profile: ArtistProfile | null;
  isLoading: boolean;
  error: string | null;
  isArtist: boolean;
  isVerifiedArtist: boolean;
  isEmergingArtist: boolean;
  isAdmin: boolean;
  isPatron: boolean;
  isLoaded: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  const fetchProfile = async (userId: string) => {
    try {
      // Get the profile
      const { data: dbProfile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          artworks:artworks!artworks_artist_id_fkey(count)
        `)
        .eq('id', userId)
        .single();
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile not found - this is expected for new users
          return null;
        }
        throw new Error(profileError.message);
      }

      if (!dbProfile) {
        return null;
      }

      // Convert database profile to ArtistProfile type
      const artistProfile: ArtistProfile = {
        ...dbProfile,
        features: null, // This will be computed by the useArtist hook
        verificationProgress: null // This will be computed by the useVerification hook
      };

      return artistProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch profile');
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
          try {
            const profile = await fetchProfile(session.user.id);
            setProfile(profile); // profile may be null for new users
          } catch (error) {
            console.error('Error fetching profile:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch profile');
            setProfile(null);
          }
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
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      try {
        setError(null);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const profile = await fetchProfile(session.user.id);
            setProfile(profile); // profile may be null for new users
          } catch (error) {
            console.error('Error fetching profile:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch profile');
            setProfile(null);
          }
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

  return {
    user,
    profile,
    isLoading,
    error,
    isArtist: isAnyArtist(profile?.role ?? null),
    isVerifiedArtist: isVerifiedArtist(profile?.role ?? null),
    isEmergingArtist: isEmergingArtist(profile?.role ?? null),
    isAdmin: isAdmin(profile?.role ?? null),
    isPatron: isPatron(profile?.role ?? null),
    isLoaded: !isLoading,
  };
} 