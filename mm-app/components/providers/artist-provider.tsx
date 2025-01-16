'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { ArtistProfile } from '@/lib/types/custom-types'
import { isVerifiedArtist, isEmergingArtist, getRolePermissions } from '@/lib/utils/role-utils'

interface ArtistContextType {
  profile: ArtistProfile | null
  features: ReturnType<typeof getRolePermissions> | null
  verificationProgress: number | null
  isVerifiedArtist: boolean
  isEmergingArtist: boolean
}

const ArtistContext = createContext<ArtistContextType | undefined>(undefined)

interface ArtistProviderProps {
  children: ReactNode
  profile: ArtistProfile | null
}

export function ArtistProvider({ children, profile }: ArtistProviderProps) {
  const features = profile ? getRolePermissions(profile.role) : null;

  const value = {
    profile,
    features,
    verificationProgress: profile?.verification_progress ?? null,
    isVerifiedArtist: isVerifiedArtist(profile?.role ?? null),
    isEmergingArtist: isEmergingArtist(profile?.role ?? null)
  }

  return (
    <ArtistContext.Provider value={value}>
      {children}
    </ArtistContext.Provider>
  )
}

export function useArtist() {
  const context = useContext(ArtistContext)
  if (context === undefined) {
    throw new Error('useArtist must be used within an ArtistProvider')
  }
  return context
} 