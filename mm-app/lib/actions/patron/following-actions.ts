import { createActionClient } from '@/lib/supabase/supabase-action'
import { revalidatePath } from 'next/cache'
import type { FollowingArtist } from '@/lib/types/patron-types'
import type { Database } from '@/lib/types/database.types'

export async function followArtist(artistId: string) {
  const supabase = await createActionClient()
  
  // Get current user's ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if target user is an artist
  const { data: targetUser, error: targetError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', artistId)
    .single()

  if (targetError) throw targetError
  if (!targetUser?.role || !['artist', 'emerging_artist', 'verified_artist'].includes(targetUser.role)) {
    throw new Error('Can only follow artist profiles')
  }

  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: artistId,
    })

  if (error) throw error
  
  revalidatePath('/patron/following')
}

export async function unfollowArtist(artistId: string) {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('follows')
    .delete()
    .match({
      follower_id: user.id,
      following_id: artistId,
    })

  if (error) throw error
  
  revalidatePath('/patron/following')
}

export async function getFollowedArtists(): Promise<FollowingArtist[]> {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('follows')
    .select(`
      profiles!following_id(
        id,
        name,
        avatar_url,
        artist_type
      )
    `)
    .eq('follower_id', user.id)
    .order('created_at', { ascending: false }) as unknown as { data: { profiles: FollowingArtist }[] | null, error: null }

  if (error) throw error
  
  return (data?.map(item => item.profiles) || [])
}

export async function isFollowingArtist(artistId: string): Promise<boolean> {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .match({
      follower_id: user.id,
      following_id: artistId,
    })
    .maybeSingle()

  if (error) throw error
  
  return !!data
}

export async function getFollowerCount(artistId: string): Promise<number> {
  const supabase = await createActionClient()
  
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', artistId)

  if (error) throw error
  
  return count || 0
} 