'use server'

import { createActionClient } from '@/lib/supabase/supabase-action'
import { revalidatePath } from 'next/cache'

export async function getArtistProfile() {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: artist, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .in('role', ['verified_artist', 'emerging_artist'])
    .single()

  if (error || !artist) return null

  return artist
} 