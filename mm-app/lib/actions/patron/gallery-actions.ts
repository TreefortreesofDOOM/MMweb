import { createActionClient } from '@/lib/supabase/supabase-action'
import { revalidatePath } from 'next/cache'

interface GalleryVisit {
  userId: string
  visitType: string
  metadata?: Record<string, any>
}

export async function recordGalleryVisit({
  userId,
  visitType,
  metadata
}: GalleryVisit) {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('gallery_visits')
    .insert({
      user_id: userId,
      scanned_by: user.id,
      visit_type: visitType,
      metadata
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath(`/patron/gallery/${userId}`)
  return data
}

export async function getGalleryVisits(userId: string) {
  const supabase = await createActionClient()

  const { data, error } = await supabase
    .from('gallery_visits')
    .select(`
      *,
      scanned_by (
        id,
        name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getRecentGalleryVisits(limit = 10) {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('gallery_visits')
    .select(`
      *,
      profiles!gallery_visits_user_id_fkey (
        id,
        name,
        avatar_url
      )
    `)
    .eq('scanned_by', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
} 