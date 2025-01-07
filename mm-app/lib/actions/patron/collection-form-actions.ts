'use server'

import { createActionClient } from '@/lib/supabase/supabase-action-utils'
import { revalidatePath } from 'next/cache'

export async function updateCollectionAction(data: {
  id: string
  name: string
  description?: string
  isPrivate?: boolean
}) {
  const supabase = await createActionClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('collections')
    .update({
      name: data.name,
      description: data.description,
      is_private: data.isPrivate,
    })
    .eq('patron_id', user.id)
    .eq('id', data.id)

  if (error) throw error
  
  revalidatePath('/patron/collections')
  revalidatePath(`/patron/collections/${data.id}`)
} 