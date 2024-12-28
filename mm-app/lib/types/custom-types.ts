import type { Database } from '@/lib/database.types'

// Artist Role Types
export const ARTIST_ROLES = {
  VERIFIED: 'verified',
  EMERGING: 'emerging',
} as const

export type ArtistRole = typeof ARTIST_ROLES[keyof typeof ARTIST_ROLES]

// Artist Feature Access Interface
export interface ArtistFeatures {
  maxArtworks: number
  canAccessGallery: boolean
  canAccessAnalytics: boolean
  canAccessMessaging: boolean
  stripeRequirements: {
    required: boolean
    minimumArtworks: number
  }
}

// Artist Verification Requirements
export interface VerificationRequirements {
  minimumArtworks: number
  portfolioComplete: boolean
  bioComplete: boolean
  contactInfoComplete: boolean
  stripeConnected: boolean
}

// Base Profile Type
export type Profile = Database['public']['Tables']['profiles']['Row']

// Extended Profile Type with Artist Features
export type ArtistProfile = Omit<Profile, 'artist_type'> & {
  artist_type: ArtistRole | null
  features: ArtistFeatures | null
  verificationProgress: VerificationRequirements | null
} 