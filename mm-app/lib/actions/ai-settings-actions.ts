'use server'

import { createActionClient } from '@/lib/supabase/supabase-action-utils'
import { AISettings, aiSettingsSchema } from '@/lib/types/ai-settings'
import { revalidatePath } from 'next/cache'

export async function updateAISettings(settings: Partial<AISettings>) {
  try {
    const supabase = await createActionClient()
    
    const { error } = await supabase
      .from('ai_settings')
      .upsert(settings, { onConflict: 'id' })

    if (error) throw error

    revalidatePath('/admin/ai-settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating AI settings:', error)
    return { success: false, error }
  }
}

export async function getAISettings() {
  try {
    const supabase = await createActionClient()
    
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .single()

    if (error) throw error

    const settings = aiSettingsSchema.parse(data)
    return { success: true, data: settings }
  } catch (error) {
    console.error('Error getting AI settings:', error)
    return { success: false, error }
  }
} 