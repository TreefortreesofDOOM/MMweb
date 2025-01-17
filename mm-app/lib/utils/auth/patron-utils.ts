import { createActionClient } from '@/lib/supabase/supabase-action'

export async function isPatron(): Promise<boolean> {
  const supabase = await createActionClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return false

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !data) return false
  
  return data.role === 'patron'
}

export function validateCollectionName(name: string): boolean {
  return name.length >= 3 && name.length <= 50
}

export function validateCollectionDescription(description?: string): boolean {
  if (!description) return true
  return description.length <= 500
} 