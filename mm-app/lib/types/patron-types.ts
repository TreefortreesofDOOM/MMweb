import type { Database } from './database.types'

export type CollectionItem = Database['public']['Tables']['collection_items']['Row'] & {
  transactions: {
    amount_total: number
    buyer_id: string
    status: string
  }
  artworks: {
    id: string
    title: string
    description: string | null
    price: number | null
    images: any[]
    artist_id: string
    profiles: {
      full_name: string | null
    } | null
  }
}

export type CollectionWithItems = Database['public']['Tables']['collections']['Row'] & {
  collection_items: CollectionItem[]
}

export type CollectionWithCount = Database['public']['Tables']['collections']['Row'] & {
  collection_items: { count: number }[]
}

export type FollowingArtist = {
  id: string
  name: string | null
  avatar_url: string | null
  role?: string | null
} 