export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          artist_application: Json | null
          artist_approved_at: string | null
          artist_approved_by: string | null
          artist_rejection_reason: string | null
          artist_status: Database["public"]["Enums"]["artist_application_status"] | null
          bio: string | null
          created_at: string
          email: string
          id: string
          instagram: string | null
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          artist_application?: Json | null
          artist_approved_at?: string | null
          artist_approved_by?: string | null
          artist_rejection_reason?: string | null
          artist_status?: Database["public"]["Enums"]["artist_application_status"] | null
          bio?: string | null
          created_at?: string
          email: string
          id: string
          instagram?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          artist_application?: Json | null
          artist_approved_at?: string | null
          artist_approved_by?: string | null
          artist_rejection_reason?: string | null
          artist_status?: Database["public"]["Enums"]["artist_application_status"] | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          instagram?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      artwork_embeddings: {
        Row: {
          id: string
          artwork_id: string
          embedding: number[]
          embedding_type: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artwork_id: string
          embedding: number[]
          embedding_type: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artwork_id?: string
          embedding?: number[]
          embedding_type?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artwork_embeddings_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          }
        ]
      }
      text_embeddings: {
        Row: {
          id: string
          content_type: string
          content_id: string
          embedding: number[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_type: string
          content_id: string
          embedding: number[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_type?: string
          content_id?: string
          embedding?: number[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_artworks: {
        Args: {
          query_embedding: number[]
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
    Enums: {
      user_role: "user" | "artist" | "admin"
      artist_application_status: "draft" | "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

