import type { Database } from './database.types'

// Base Types from Database
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Artwork = Database['public']['Tables']['artworks']['Row']
export type UserRole = Database['public']['Enums']['user_role']

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

// Extended Profile Type with Artist Features
export type ArtistProfile = Profile & {
  features: ArtistFeatures | null
  verificationProgress: VerificationRequirements | null
}

// Extended Artwork Type with Artist Profile
export interface ArtworkWithArtist extends Artwork {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'bio'>
} 