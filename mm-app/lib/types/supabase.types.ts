import type { Database } from './database.types'

export type MoveCollectionItemsParams = {
  p_source_collection_id: string
  p_target_collection_id: string
  p_artwork_ids: string[]
}

declare global {
  namespace Database {
    interface Functions {
      move_collection_items: {
        Args: MoveCollectionItemsParams
        Returns: void
      }
    }
  }
} 