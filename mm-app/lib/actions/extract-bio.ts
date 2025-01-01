'use server'

import { createActionClient } from '@/lib/supabase/supabase-action-utils'
import { extractBioFromWebsite } from '@/lib/ai/website-bio-extractor'

export interface ExtractBioResponse {
  bio: string;
  error?: string;
}

export async function extractBioAction(website: string): Promise<ExtractBioResponse> {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { bio: '', error: 'Not authenticated' }
  }

  try {
    const { bio, error, status } = await extractBioFromWebsite(website)
    
    if (status === 'error' || error) {
      return { bio: '', error: error || 'Failed to extract bio' }
    }

    return { bio }
  } catch (err) {
    console.error('Error extracting bio:', err)
    return { bio: '', error: 'Failed to extract bio' }
  }
} 