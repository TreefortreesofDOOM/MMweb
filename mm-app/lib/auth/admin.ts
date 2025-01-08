import { createClient } from '@/lib/supabase/supabase-server'
import { ok, err, type Result } from '@/lib/utils/result'
import type { MMAIError } from '@/lib/types/admin/mm-ai-types'
import type { NextRequest } from 'next/server'

export const validateAdminAuth = async (
  request: NextRequest
): Promise<Result<true, MMAIError>> => {
  try {
    const supabase = await createClient()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return err({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile?.role || profile.role !== 'admin') {
      return err({ code: 'UNAUTHORIZED', message: 'Admin access required' })
    }

    return ok(true)
  } catch (error) {
    return err({ code: 'UNAUTHORIZED', message: 'Authentication failed' })
  }
} 