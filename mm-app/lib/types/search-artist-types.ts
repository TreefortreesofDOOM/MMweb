import { type SupabaseClient } from '@supabase/supabase-js';

export interface SearchParams {
  query?: string;
  artistType?: string;
  sortBy?: 'created_at' | 'view_count' | 'name';
  sortOrder?: 'asc' | 'desc';
  page: number;
}

export interface RawArtistData {
  id: string;
  role: string;
  full_name: string | null;
  exhibition_badge: boolean;
  created_at: string;
  artworks: Array<{ count: number }>;
}

export type CacheEntry<T = any> = {
  data: T;
  timestamp: number;
};

export type SearchResult = {
  id: string;
  rank: number;
  full_name: string;
  bio: string;
  location: string;
}

export type SupabaseQuery = ReturnType<SupabaseClient['from']>;
