import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

let supabaseClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function createBrowserClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}
