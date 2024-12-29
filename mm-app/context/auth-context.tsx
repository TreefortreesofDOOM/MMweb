'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@supabase/supabase-js';
import type { ArtistProfile } from '@/lib/types/custom-types';

interface AuthContextType {
  user: User | null;
  profile: ArtistProfile | null;
  isLoading: boolean;
  error: string | null;
  isArtist: boolean;
  isVerifiedArtist: boolean;
  isEmergingArtist: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const value = {
    ...auth,
    profile: auth.profile as ArtistProfile | null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 