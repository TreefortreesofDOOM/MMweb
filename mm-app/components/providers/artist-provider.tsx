'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { ArtistProfile, ArtistFeatures, VerificationRequirements } from '@/lib/types/custom-types'
import { ARTIST_ROLES } from '@/lib/types/custom-types'

interface ArtistContextType {
  profile: ArtistProfile | null
  features: ArtistFeatures | null
  verificationProgress: VerificationRequirements | null
  isVerifiedArtist: boolean
  isEmergingArtist: boolean
}

const ArtistContext = createContext<ArtistContextType | undefined>(undefined)

interface ArtistProviderProps {
  children: ReactNode
  profile: ArtistProfile | null
}

export function ArtistProvider({ children, profile }: ArtistProviderProps) {
  // Default feature access based on role
  const features: ArtistFeatures | null = profile ? {
    maxArtworks: profile.artist_type === ARTIST_ROLES.VERIFIED ? Infinity : 10,
    canAccessGallery: profile.artist_type === ARTIST_ROLES.VERIFIED,
    canAccessAnalytics: profile.artist_type === ARTIST_ROLES.VERIFIED,
    canAccessMessaging: profile.artist_type === ARTIST_ROLES.VERIFIED,
    stripeRequirements: {
      required: profile.artist_type === ARTIST_ROLES.VERIFIED,
      minimumArtworks: 5
    }
  } : null

  const value = {
    profile,
    features,
    verificationProgress: profile?.verificationProgress ?? null,
    isVerifiedArtist: profile?.artist_type === ARTIST_ROLES.VERIFIED,
    isEmergingArtist: profile?.artist_type === ARTIST_ROLES.EMERGING
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