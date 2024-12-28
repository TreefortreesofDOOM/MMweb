export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Artist Role Types
export const ARTIST_ROLES = {
  VERIFIED: 'verified_artist',
  EMERGING: 'emerging_artist',
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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          first_name: string | null
          last_name: string | null
          email: string
          avatar_url: string | null
          bio: string | null
          website: string | null
          instagram: string | null
          role: Database["public"]["Enums"]["user_role"]
          artist_type: 'emerging' | 'verified' | null
          artist_status: Database["public"]["Enums"]["artist_application_status"] | null
          verification_progress: number
          verification_requirements: {
            portfolio_complete: boolean
            identity_verified: boolean
            gallery_connection: boolean
            sales_history: boolean
            community_engagement: boolean
          } | null
          artist_application: Json | null
          artist_approved_at: string | null
          artist_approved_by: string | null
          artist_rejection_reason: string | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          features?: ArtistFeatures
          verificationProgress?: VerificationRequirements
          view_count: number
          exhibition_badge: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          instagram?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          artist_type?: 'emerging' | 'verified' | null
          artist_status?: Database["public"]["Enums"]["artist_application_status"] | null
          verification_progress?: number
          verification_requirements?: {
            portfolio_complete: boolean
            identity_verified: boolean
            gallery_connection: boolean
            sales_history: boolean
            community_engagement: boolean
          } | null
          artist_application?: Json | null
          artist_approved_at?: string | null
          artist_approved_by?: string | null
          artist_rejection_reason?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          features?: ArtistFeatures
          verificationProgress?: VerificationRequirements
          view_count?: number
          exhibition_badge?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          instagram?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          artist_type?: 'emerging' | 'verified' | null
          artist_status?: Database["public"]["Enums"]["artist_application_status"] | null
          verification_progress?: number
          verification_requirements?: {
            portfolio_complete: boolean
            identity_verified: boolean
            gallery_connection: boolean
            sales_history: boolean
            community_engagement: boolean
          } | null
          artist_application?: Json | null
          artist_approved_at?: string | null
          artist_approved_by?: string | null
          artist_rejection_reason?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          features?: ArtistFeatures
          verificationProgress?: VerificationRequirements
          view_count?: number
          exhibition_badge?: boolean
        }
        Relationships: []
      }
      artworks: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number | null
          artist_id: string
          images: Json
          styles: string[] | null
          techniques: string[] | null
          keywords: string[] | null
          status: Database["public"]["Enums"]["artwork_status"]
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price?: number | null
          artist_id: string
          images?: Json
          styles?: string[] | null
          techniques?: string[] | null
          keywords?: string[] | null
          status?: Database["public"]["Enums"]["artwork_status"]
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number | null
          artist_id?: string
          images?: Json
          styles?: string[] | null
          techniques?: string[] | null
          keywords?: string[] | null
          status?: Database["public"]["Enums"]["artwork_status"]
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      gallery_visits: {
        Row: {
          id: string
          user_id: string
          scanned_by: string
          visit_type: 'physical' | 'virtual'
          metadata: {
            timestamp: string
            location: string
            ip?: string
            userAgent?: string
            deviceType?: string
            browserInfo?: string
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scanned_by: string
          visit_type: 'physical' | 'virtual'
          metadata?: {
            timestamp: string
            location: string
            ip?: string
            userAgent?: string
            deviceType?: string
            browserInfo?: string
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scanned_by?: string
          visit_type?: 'physical' | 'virtual'
          metadata?: {
            timestamp?: string
            location?: string
            ip?: string
            userAgent?: string
            deviceType?: string
            browserInfo?: string
          }
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_visits_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      verification_progress: {
        Row: {
          id: string
          user_id: string
          current_step: string
          steps_completed: string[]
          next_steps: string[]
          requirements_met: Json
          feedback: string | null
          reviewer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_step: string
          steps_completed?: string[]
          next_steps?: string[]
          requirements_met?: Json
          feedback?: string | null
          reviewer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_step?: string
          steps_completed?: string[]
          next_steps?: string[]
          requirements_met?: Json
          feedback?: string | null
          reviewer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_progress_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      artist_features: {
        Row: {
          user_id: string
          feature_name: string
          enabled: boolean
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          user_id: string
          feature_name: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          user_id?: string
          feature_name?: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "artist_features_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Enums: {
      user_role: "user" | "artist" | "admin"
      artist_application_status: "draft" | "pending" | "approved" | "rejected"
      artwork_status: "draft" | "published" | "sold"
    }
    Functions: {
      match_artworks: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          artwork_id: string
          similarity: number
        }[]
      }
    }
  }
}

// Extended Profile Type with Artist Features
export type ArtistProfile = Database['public']['Tables']['profiles']['Row'] & {
  role: ArtistRole
  features?: ArtistFeatures
  verificationProgress?: VerificationRequirements
}

