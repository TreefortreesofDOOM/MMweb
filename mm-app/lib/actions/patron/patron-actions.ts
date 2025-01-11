'use server'

import { createActionClient } from '@/lib/supabase/supabase-action'
import { revalidatePath } from 'next/cache'

export async function getPatronProfile() {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: patron, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .eq('role', 'patron')
    .single()

  if (error || !patron) return null

  return patron
} 