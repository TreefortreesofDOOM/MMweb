'use server'

import { createActionClient } from '@/lib/supabase/supabase-action-utils'

export async function getArtistArtworks({ status = "all" }: { status?: "published" | "draft" | "all" }, context?: string) {
  const supabase = await createActionClient()
  const contextData = context ? JSON.parse(context) : {}
  
  if (!contextData.userId) {
    throw new Error("User ID is required")
  }

  let query = supabase
    .from('artworks')
    .select(`
      *,
      profiles (
        name,
        bio,
        avatar_url
      )
    `)
    .eq('artist_id', contextData.userId)
  
  if (status !== "all") {
    query = query.eq('status', status)
  }

  const { data: artworks, error } = await query
  if (error) throw error
  
  return { artworks }
}

export async function getArtworkDetails({ artworkId }: { artworkId: string }) {
  const supabase = await createActionClient()
  const { data: artwork, error } = await supabase
    .from('artworks')
    .select(`
      *,
      profiles (
        name,
        bio,
        avatar_url
      )
    `)
    .eq('id', artworkId)
    .single()
  
  if (error) throw error
  
  return { artwork }
}