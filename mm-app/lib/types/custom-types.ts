import type { Database } from './database.types'

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

// Base Types from Database
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Artwork = Database['public']['Tables']['artworks']['Row']

// Extended Profile Type with Artist Features
export type ArtistProfile = Profile & {
  artist_type: ArtistRole | null
  features: ArtistFeatures | null
  verificationProgress: VerificationRequirements | null
}

// Extended Artwork Type with Artist Profile
export interface ArtworkWithArtist extends Artwork {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'bio'>
} 