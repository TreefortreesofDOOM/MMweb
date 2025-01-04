'use server'

import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Database } from '@/lib/types/database.types'

type GhostProfilesResponse = {
  error: any | null
}

export async function updateGhostProfileVisibility(id: string, makeVisible: boolean): Promise<GhostProfilesResponse> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('ghost_profiles')
    .update({ is_visible: makeVisible })
    .eq('id', id)
  
  return { error }
}

export async function updateGhostProfilesBatchVisibility(ids: string[], makeVisible: boolean): Promise<GhostProfilesResponse> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('ghost_profiles')
    .update({ is_visible: makeVisible })
    .in('id', ids)
  
  return { error }
} 