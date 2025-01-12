export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_settings: {
        Row: {
          created_at: string
          fallback_provider: string | null
          id: string
          primary_provider: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fallback_provider?: string | null
          id?: string
          primary_provider: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fallback_provider?: string | null
          id?: string
          primary_provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      artist_features: {
        Row: {
          created_at: string
          enabled: boolean | null
          feature_name: string
          metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          feature_name: string
          metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          feature_name?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_features_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "artist_features_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_features_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_embeddings: {
        Row: {
          artwork_id: string | null
          created_at: string | null
          embedding: string | null
          embedding_type: string
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          artwork_id?: string | null
          created_at?: string | null
          embedding?: string | null
          embedding_type: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          artwork_id?: string | null
          created_at?: string | null
          embedding?: string | null
          embedding_type?: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artwork_embeddings_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_embeddings_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks_with_artist"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_embeddings_gemini: {
        Row: {
          artwork_id: string | null
          created_at: string | null
          embedding: string
          embedding_type: string
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          artwork_id?: string | null
          created_at?: string | null
          embedding: string
          embedding_type: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          artwork_id?: string | null
          created_at?: string | null
          embedding?: string
          embedding_type?: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artwork_embeddings_gemini_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_embeddings_gemini_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks_with_artist"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_favorites: {
        Row: {
          artwork_id: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artwork_id: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artwork_favorites_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_favorites_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks_with_artist"
            referencedColumns: ["id"]
          },
        ]
      }
      artworks: {
        Row: {
          ai_context: Json | null
          ai_generated: boolean | null
          ai_metadata: Json | null
          analysis_results: Json[] | null
          artist_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          gallery_approved_at: string | null
          gallery_approved_by: string | null
          gallery_price: number | null
          gallery_wall_type:
            | Database["public"]["Enums"]["gallery_wall_type"]
            | null
          id: string
          images: Json
          keywords: string[] | null
          price: number | null
          status: Database["public"]["Enums"]["artwork_status"]
          styles: string[] | null
          techniques: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_context?: Json | null
          ai_generated?: boolean | null
          ai_metadata?: Json | null
          analysis_results?: Json[] | null
          artist_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          gallery_approved_at?: string | null
          gallery_approved_by?: string | null
          gallery_price?: number | null
          gallery_wall_type?:
            | Database["public"]["Enums"]["gallery_wall_type"]
            | null
          id?: string
          images?: Json
          keywords?: string[] | null
          price?: number | null
          status?: Database["public"]["Enums"]["artwork_status"]
          styles?: string[] | null
          techniques?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_context?: Json | null
          ai_generated?: boolean | null
          ai_metadata?: Json | null
          analysis_results?: Json[] | null
          artist_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          gallery_approved_at?: string | null
          gallery_approved_by?: string | null
          gallery_price?: number | null
          gallery_wall_type?:
            | Database["public"]["Enums"]["gallery_wall_type"]
            | null
          id?: string
          images?: Json
          keywords?: string[] | null
          price?: number | null
          status?: Database["public"]["Enums"]["artwork_status"]
          styles?: string[] | null
          techniques?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artworks_gallery_approved_by_fkey"
            columns: ["gallery_approved_by"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "artworks_gallery_approved_by_fkey"
            columns: ["gallery_approved_by"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artworks_gallery_approved_by_fkey"
            columns: ["gallery_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          artwork_id: string | null
          assistant_type: string
          context: Json | null
          created_at: string
          id: string
          message: string
          message_embedding: string | null
          metadata: Json | null
          response: string
          response_embedding: string | null
          user_id: string
        }
        Insert: {
          artwork_id?: string | null
          assistant_type: string
          context?: Json | null
          created_at?: string
          id?: string
          message: string
          message_embedding?: string | null
          metadata?: Json | null
          response: string
          response_embedding?: string | null
          user_id: string
        }
        Update: {
          artwork_id?: string | null
          assistant_type?: string
          context?: Json | null
          created_at?: string
          id?: string
          message?: string
          message_embedding?: string | null
          metadata?: Json | null
          response?: string
          response_embedding?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_history_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks_with_artist"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          added_at: string
          artwork_id: string
          collection_id: string
          display_order: number | null
          notes: string | null
          transaction_id: string | null
        }
        Insert: {
          added_at?: string
          artwork_id: string
          collection_id: string
          display_order?: number | null
          notes?: string | null
          transaction_id?: string | null
        }
        Update: {
          added_at?: string
          artwork_id?: string
          collection_id?: string
          display_order?: number | null
          notes?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks_with_artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_views: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          referrer: string | null
          source: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          referrer?: string | null
          source?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          referrer?: string | null
          source?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_views_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_private: boolean | null
          is_purchased: boolean | null
          metadata: Json | null
          name: string
          patron_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          is_purchased?: boolean | null
          metadata?: Json | null
          name: string
          patron_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          is_purchased?: boolean | null
          metadata?: Json | null
          name?: string
          patron_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_patron_id_fkey"
            columns: ["patron_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "collections_patron_id_fkey"
            columns: ["patron_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_patron_id_fkey"
            columns: ["patron_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_usage: {
        Row: {
          created_at: string
          feature_name: string
          id: string
          last_used_at: string | null
          metadata: Json | null
          updated_at: string
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feature_name: string
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feature_name?: string
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "feature_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_artist: {
        Row: {
          active: boolean | null
          artist_id: string
          created_at: string
          created_by: string | null
          id: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          artist_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          artist_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_artist_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "featured_artist_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_artist_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_artist_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "featured_artist_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_artist_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_dates: {
        Row: {
          date: string
          is_available: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          date: string
          is_available?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          date?: string
          is_available?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_dates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "gallery_dates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_dates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_show_artworks: {
        Row: {
          artwork_id: string
          show_id: string
        }
        Insert: {
          artwork_id: string
          show_id: string
        }
        Update: {
          artwork_id?: string
          show_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_show_artworks_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_show_artworks_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks_with_artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_show_artworks_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "gallery_shows"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_shows: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_shows_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "gallery_shows_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_shows_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_shows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "gallery_shows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_shows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_visits: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          scanned_by: string
          updated_at: string
          user_id: string
          visit_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          scanned_by: string
          updated_at?: string
          user_id: string
          visit_type: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          scanned_by?: string
          updated_at?: string
          user_id?: string
          visit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_visits_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "gallery_visits_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_visits_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "gallery_visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ghost_profiles: {
        Row: {
          claimed_profile_id: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          is_claimed: boolean | null
          is_visible: boolean | null
          last_purchase_date: string | null
          metadata: Json | null
          stripe_customer_id: string | null
          total_purchases: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          claimed_profile_id?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          is_claimed?: boolean | null
          is_visible?: boolean | null
          last_purchase_date?: string | null
          metadata?: Json | null
          stripe_customer_id?: string | null
          total_purchases?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          claimed_profile_id?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          is_claimed?: boolean | null
          is_visible?: boolean | null
          last_purchase_date?: string | null
          metadata?: Json | null
          stripe_customer_id?: string | null
          total_purchases?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ghost_profiles_claimed_profile_id_fkey"
            columns: ["claimed_profile_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ghost_profiles_claimed_profile_id_fkey"
            columns: ["claimed_profile_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghost_profiles_claimed_profile_id_fkey"
            columns: ["claimed_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      partial_registrations: {
        Row: {
          created_at: string
          data: Json
          email: string
          expires_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          email: string
          expires_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          email?: string
          expires_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          artist_application: Json | null
          artist_approved_at: string | null
          artist_approved_by: string | null
          artist_rejection_reason: string | null
          artist_status:
            | Database["public"]["Enums"]["artist_application_status"]
            | null
          artist_type: string | null
          avatar_url: string | null
          bio: string | null
          community_engagement_score: number | null
          created_at: string
          email: string
          exhibition_badge: boolean | null
          first_name: string | null
          full_name: string | null
          ghost_profile_claimed: boolean | null
          id: string
          instagram: string | null
          last_name: string | null
          last_notification_sent: string | null
          last_notification_type: string | null
          last_purchase_date: string | null
          location: string | null
          medium: string[] | null
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          total_purchases: number | null
          total_spent: number | null
          updated_at: string
          verification_progress: number | null
          verification_requirements: Json | null
          verification_status: string | null
          verification_status_updated_at: string | null
          view_count: number | null
          website: string | null
        }
        Insert: {
          artist_application?: Json | null
          artist_approved_at?: string | null
          artist_approved_by?: string | null
          artist_rejection_reason?: string | null
          artist_status?:
            | Database["public"]["Enums"]["artist_application_status"]
            | null
          artist_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          community_engagement_score?: number | null
          created_at?: string
          email: string
          exhibition_badge?: boolean | null
          first_name?: string | null
          full_name?: string | null
          ghost_profile_claimed?: boolean | null
          id: string
          instagram?: string | null
          last_name?: string | null
          last_notification_sent?: string | null
          last_notification_type?: string | null
          last_purchase_date?: string | null
          location?: string | null
          medium?: string[] | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_purchases?: number | null
          total_spent?: number | null
          updated_at?: string
          verification_progress?: number | null
          verification_requirements?: Json | null
          verification_status?: string | null
          verification_status_updated_at?: string | null
          view_count?: number | null
          website?: string | null
        }
        Update: {
          artist_application?: Json | null
          artist_approved_at?: string | null
          artist_approved_by?: string | null
          artist_rejection_reason?: string | null
          artist_status?:
            | Database["public"]["Enums"]["artist_application_status"]
            | null
          artist_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          community_engagement_score?: number | null
          created_at?: string
          email?: string
          exhibition_badge?: boolean | null
          first_name?: string | null
          full_name?: string | null
          ghost_profile_claimed?: boolean | null
          id?: string
          instagram?: string | null
          last_name?: string | null
          last_notification_sent?: string | null
          last_notification_type?: string | null
          last_purchase_date?: string | null
          location?: string | null
          medium?: string[] | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_purchases?: number | null
          total_spent?: number | null
          updated_at?: string
          verification_progress?: number | null
          verification_requirements?: Json | null
          verification_status?: string | null
          verification_status_updated_at?: string | null
          view_count?: number | null
          website?: string | null
        }
        Relationships: []
      }
      role_conversions: {
        Row: {
          conversion_type: string
          created_at: string
          from_role: Database["public"]["Enums"]["user_role"] | null
          id: string
          metadata: Json | null
          to_role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
        }
        Insert: {
          conversion_type: string
          created_at?: string
          from_role?: Database["public"]["Enums"]["user_role"] | null
          id?: string
          metadata?: Json | null
          to_role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Update: {
          conversion_type?: string
          created_at?: string
          from_role?: Database["public"]["Enums"]["user_role"] | null
          id?: string
          metadata?: Json | null
          to_role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_conversions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "role_conversions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_conversions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      text_embeddings: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_received: number | null
          amount_total: number
          artist_amount: number
          artist_id: string | null
          artwork_id: string | null
          billing_address_city: string | null
          billing_address_country: string | null
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_address_postal_code: string | null
          billing_address_state: string | null
          billing_email: string | null
          billing_name: string | null
          billing_phone: string | null
          buyer_id: string | null
          capture_method: string | null
          card_brand: string | null
          card_country: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          confirmation_method: string | null
          created_at: string | null
          description: string | null
          error_code: string | null
          error_message: string | null
          ghost_profile_id: string | null
          id: string
          invoice_id: string | null
          is_gallery_entry: boolean | null
          last_payment_error: Json | null
          metadata: Json | null
          payment_intent_status: string | null
          payment_method_details: Json | null
          payment_method_id: string | null
          payment_method_type: string | null
          payment_method_types: string[] | null
          platform_fee: number
          refund_reason: string | null
          refund_status: string | null
          refunded: boolean | null
          statement_descriptor: string | null
          statement_descriptor_suffix: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_canceled_at: string | null
          stripe_created: string | null
          stripe_payment_intent_id: string | null
          stripe_processing_at: string | null
          stripe_succeeded_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount_received?: number | null
          amount_total: number
          artist_amount: number
          artist_id?: string | null
          artwork_id?: string | null
          billing_address_city?: string | null
          billing_address_country?: string | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_address_postal_code?: string | null
          billing_address_state?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_phone?: string | null
          buyer_id?: string | null
          capture_method?: string | null
          card_brand?: string | null
          card_country?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          confirmation_method?: string | null
          created_at?: string | null
          description?: string | null
          error_code?: string | null
          error_message?: string | null
          ghost_profile_id?: string | null
          id?: string
          invoice_id?: string | null
          is_gallery_entry?: boolean | null
          last_payment_error?: Json | null
          metadata?: Json | null
          payment_intent_status?: string | null
          payment_method_details?: Json | null
          payment_method_id?: string | null
          payment_method_type?: string | null
          payment_method_types?: string[] | null
          platform_fee: number
          refund_reason?: string | null
          refund_status?: string | null
          refunded?: boolean | null
          statement_descriptor?: string | null
          statement_descriptor_suffix?: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_canceled_at?: string | null
          stripe_created?: string | null
          stripe_payment_intent_id?: string | null
          stripe_processing_at?: string | null
          stripe_succeeded_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_received?: number | null
          amount_total?: number
          artist_amount?: number
          artist_id?: string | null
          artwork_id?: string | null
          billing_address_city?: string | null
          billing_address_country?: string | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_address_postal_code?: string | null
          billing_address_state?: string | null
          billing_email?: string | null
          billing_name?: string | null
          billing_phone?: string | null
          buyer_id?: string | null
          capture_method?: string | null
          card_brand?: string | null
          card_country?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          confirmation_method?: string | null
          created_at?: string | null
          description?: string | null
          error_code?: string | null
          error_message?: string | null
          ghost_profile_id?: string | null
          id?: string
          invoice_id?: string | null
          is_gallery_entry?: boolean | null
          last_payment_error?: Json | null
          metadata?: Json | null
          payment_intent_status?: string | null
          payment_method_details?: Json | null
          payment_method_id?: string | null
          payment_method_type?: string | null
          payment_method_types?: string[] | null
          platform_fee?: number
          refund_reason?: string | null
          refund_status?: string | null
          refunded?: boolean | null
          statement_descriptor?: string | null
          statement_descriptor_suffix?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_canceled_at?: string | null
          stripe_created?: string | null
          stripe_payment_intent_id?: string | null
          stripe_processing_at?: string | null
          stripe_succeeded_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks_with_artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_ghost_profile_id_fkey"
            columns: ["ghost_profile_id"]
            isOneToOne: false
            referencedRelation: "ghost_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          event_type: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          event_type: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          event_type?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          ai_personality: Database["public"]["Enums"]["ai_personality"] | null
          created_at: string | null
          id: string
          theme: Database["public"]["Enums"]["theme_preference"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_personality?: Database["public"]["Enums"]["ai_personality"] | null
          created_at?: string | null
          id?: string
          theme?: Database["public"]["Enums"]["theme_preference"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_personality?: Database["public"]["Enums"]["ai_personality"] | null
          created_at?: string | null
          id?: string
          theme?: Database["public"]["Enums"]["theme_preference"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          metadata: Json | null
          session_id: string
          started_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          session_id: string
          started_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          session_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_progress: {
        Row: {
          created_at: string
          current_step: string
          feedback: string | null
          id: string
          next_steps: string[] | null
          requirements_met: Json | null
          reviewer_id: string | null
          steps_completed: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step: string
          feedback?: string | null
          id?: string
          next_steps?: string[] | null
          requirements_met?: Json | null
          reviewer_id?: string | null
          steps_completed?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: string
          feedback?: string | null
          id?: string
          next_steps?: string[] | null
          requirements_met?: Json | null
          reviewer_id?: string | null
          steps_completed?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_progress_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "verification_progress_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_progress_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "verification_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      artwork_counts: {
        Row: {
          artwork_count: number | null
          profile_id: string | null
        }
        Relationships: []
      }
      artworks_with_artist: {
        Row: {
          artist_avatar_url: string | null
          artist_bio: string | null
          artist_full_name: string | null
          artist_id: string | null
          artist_name: string | null
          artist_role: Database["public"]["Enums"]["user_role"] | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string | null
          images: Json | null
          price: number | null
          status: Database["public"]["Enums"]["artwork_status"] | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artwork_counts"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profile_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_roles: {
        Row: {
          id: string | null
          mapped_role: Database["public"]["Enums"]["user_role"] | null
          original_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          id?: string | null
          mapped_role?: never
          original_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          id?: string | null
          mapped_role?: never
          original_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      user_accessible_ghost_profiles: {
        Row: {
          ghost_profile_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_gallery_show: {
        Args: {
          p_show_id: string
          p_user_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          title: string
          updated_at: string | null
        }[]
      }
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      calculate_engagement_score: {
        Args: {
          target_user_id: string
        }
        Returns: number
      }
      claim_ghost_profile: {
        Args: {
          ghost_profile_id: string
          claiming_user_id: string
        }
        Returns: undefined
      }
      cleanup_expired_registrations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_artwork_conversations: {
        Args: {
          p_user_id: string
          p_artwork_id: string
          p_match_count?: number
        }
        Returns: {
          id: string
          message: string
          response: string
          created_at: string
          metadata: Json
          context: Json
        }[]
      }
      find_similar_conversations: {
        Args: {
          p_user_id: string
          p_query: string
          p_embedding: string
          p_match_count?: number
          p_match_threshold?: number
        }
        Returns: {
          id: string
          message: string
          response: string
          similarity: number
        }[]
      }
      get_collection_stats: {
        Args: {
          collection_id: string
        }
        Returns: Json
      }
      get_user_settings: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      is_artist: {
        Args: {
          role_to_check: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_patron: {
        Args: {
          role_to_check: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
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
      match_artworks_gemini: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          artwork_id: string
          similarity: number
        }[]
      }
      move_collection_items: {
        Args: {
          p_source_collection_id: string
          p_target_collection_id: string
          p_artwork_ids: string[]
        }
        Returns: undefined
      }
      revert_claimed_ghost_profile: {
        Args: {
          target_ghost_profile_id: string
        }
        Returns: undefined
      }
      search_profiles: {
        Args: {
          search_query: string
        }
        Returns: {
          id: string
          rank: number
          full_name: string
          bio: string
          location: string
        }[]
      }
      send_email: {
        Args: {
          recipient: string
          subject: string
          content: string
          sender?: string
        }
        Returns: Json
      }
      set_featured_artist: {
        Args: {
          artist_id: string
        }
        Returns: string
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      split_name: {
        Args: {
          name: string
        }
        Returns: {
          first_name: string
          last_name: string
        }[]
      }
      update_artwork_order: {
        Args: {
          p_artwork_ids: string[]
          p_artist_id: string
        }
        Returns: undefined
      }
      update_gallery_show_dates: {
        Args: {
          p_show_id: string
          p_user_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          title: string
          updated_at: string | null
        }[]
      }
      upsert_user_preferences: {
        Args: {
          p_user_id: string
          p_theme: Database["public"]["Enums"]["theme_preference"]
          p_ai_personality?: Database["public"]["Enums"]["ai_personality"]
        }
        Returns: undefined
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      ai_personality: "HAL9000" | "GLADOS" | "JARVIS"
      artist_application_status: "draft" | "pending" | "approved" | "rejected"
      artist_status: "draft" | "pending" | "approved" | "rejected"
      artwork_status: "draft" | "published" | "sold"
      gallery_wall_type:
        | "trust_wall"
        | "collectors_wall"
        | "added_value_pedestal"
        | "featured_work"
      notification_type:
        | "email"
        | "new_artwork"
        | "new_follower"
        | "artwork_favorited"
        | "price_alert"
      payment_status:
        | "succeeded"
        | "processing"
        | "requires_payment_method"
        | "requires_confirmation"
        | "requires_action"
        | "canceled"
      theme_preference: "light" | "dark" | "system"
      user_role:
        | "user"
        | "artist"
        | "admin"
        | "emerging_artist"
        | "verified_artist"
        | "patron"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

