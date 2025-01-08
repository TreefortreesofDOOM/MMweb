'use server'

import { generateAndPost } from '@/lib/unified-ai/generate-post'
import { createClient } from '@/lib/supabase/supabase-server'
import { revalidatePath } from 'next/cache'

export type GenerateArtworkResult = {
  id: string
  imageUrl: string
  title: string
  description: string
  tags: string[]
  status?: {
    step: 'generating' | 'downloading' | 'uploading' | 'analyzing' | 'complete'
    progress?: number
  }
}

export async function generateArtwork(prompt: string): Promise<GenerateArtworkResult> {
  // Verify admin access using server client
  const supabase = await createClient()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (!session?.user) {
    throw new Error(`Unauthorized: No session found. Error: ${sessionError?.message}`)
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    throw new Error(`Unauthorized: Admin access required. Current role: ${profile?.role}`)
  }

  // Generate artwork
  const result = await generateAndPost({ prompt })
  
  if (!result.ok) {
    throw result.error
  }

  // Revalidate the artwork pages
  revalidatePath('/gallery')
  revalidatePath('/admin/artworks')
  revalidatePath('/artist/feed')
  revalidatePath('/patron/feed')

  return result.value
} 