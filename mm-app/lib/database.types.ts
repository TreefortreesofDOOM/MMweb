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
        ]
      }
      artworks: {
        Row: {
          artist_id: string
          created_at: string | null
          description: string | null
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
          artist_id: string
          created_at?: string | null
          description?: string | null
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
          artist_id?: string
          created_at?: string | null
          description?: string | null
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
          created_at: string
          email: string
          exhibition_badge: boolean | null
          first_name: string | null
          full_name: string | null
          id: string
          instagram: string | null
          last_name: string | null
          last_notification_sent: string | null
          last_notification_type: string | null
          location: string | null
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          updated_at: string
          verification_progress: number | null
          verification_requirements: Json | null
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
          created_at?: string
          email: string
          exhibition_badge?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id: string
          instagram?: string | null
          last_name?: string | null
          last_notification_sent?: string | null
          last_notification_type?: string | null
          location?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          updated_at?: string
          verification_progress?: number | null
          verification_requirements?: Json | null
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
          created_at?: string
          email?: string
          exhibition_badge?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          instagram?: string | null
          last_name?: string | null
          last_notification_sent?: string | null
          last_notification_type?: string | null
          location?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          updated_at?: string
          verification_progress?: number | null
          verification_requirements?: Json | null
          view_count?: number | null
          website?: string | null
        }
        Relationships: []
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
          amount_total: number
          artist_amount: number
          artist_id: string | null
          artwork_id: string | null
          buyer_id: string | null
          created_at: string | null
          id: string
          platform_fee: number
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_total: number
          artist_amount: number
          artist_id?: string | null
          artwork_id?: string | null
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          platform_fee: number
          status: string
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_total?: number
          artist_amount?: number
          artist_id?: string | null
          artwork_id?: string | null
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          platform_fee?: number
          status?: string
          stripe_payment_intent_id?: string | null
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
    }
    Functions: {
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
      send_email: {
        Args: {
          recipient: string
          subject: string
          content: string
          sender?: string
        }
        Returns: Json
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
      artist_application_status: "draft" | "pending" | "approved" | "rejected"
      artwork_status: "draft" | "published" | "sold"
      user_role:
        | "user"
        | "artist"
        | "admin"
        | "emerging_artist"
        | "verified_artist"
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

