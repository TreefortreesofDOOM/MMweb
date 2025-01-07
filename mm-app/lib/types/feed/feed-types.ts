import type { Database } from '../database.types'

type DbProfile = Database['public']['Tables']['profiles']['Row']
type DbArtwork = Database['public']['Tables']['artworks']['Row']

export interface Profile extends Pick<DbProfile, 'id' | 'name' | 'avatar_url'> {}

export interface Artwork extends Pick<DbArtwork, 'id' | 'title' | 'images' | 'created_at'> {}

export interface FeedItem {
  id: string
  type: 'artwork'  // MVP only supports artwork type
  content: Artwork
  creator: Profile
  timestamp: string
}

export interface FeedView {
  items: FeedItem[]
  hasMore: boolean
}

export interface FeedError {
  code: string
  message: string
}

export type FeedItemType = FeedItem['type'] 