'use server'

import { createActionClient } from '@/lib/supabase/supabase-action-utils'

export async function getArtistArtworks({ status = "all" }: { status?: "published" | "draft" | "all" }, context?: string) {
  console.log('getArtistArtworks action called:', { status, context });
  
  const supabase = await createActionClient()
  const contextData = context ? JSON.parse(context) : {}
  
  console.log('Context data:', { contextData, hasUserId: !!contextData.userId });
  
  if (!contextData.userId) {
    console.error('User ID missing from context');
    throw new Error("User ID is required")
  }

  console.log('Building query for user:', { userId: contextData.userId, status });

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
  
  console.log('Query results:', {
    success: !error,
    artworkCount: artworks?.length || 0,
    error: error?.message
  });

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