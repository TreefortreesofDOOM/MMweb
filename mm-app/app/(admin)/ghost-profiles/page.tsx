import { createClient } from '@/lib/supabase/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { GhostProfilesList } from '@/components/admin/ghost-profiles-list'
import { Database } from '@/lib/types/database.types'
import { redirect } from 'next/navigation'
import { isValidUserRole } from '@/lib/navigation/navigation-utils'
import { 
  updateGhostProfileVisibility, 
  updateGhostProfilesBatchVisibility 
} from '@/lib/ghost-profiles-actions'

export const dynamic = 'force-dynamic'

type GhostProfile = Database['public']['Tables']['ghost_profiles']['Row']

export default async function GhostProfilesPage() {
  // Get the current session using regular client
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/sign-in')
  }

  // Get the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  // Validate user role
  const userRole = profile?.role
  if (!isValidUserRole(userRole) || userRole !== 'admin') {
    redirect('/profile')
  }

  // Use service role client for admin operations
  const adminClient = createServiceRoleClient()

  // Fetch ghost profiles using service role client
  const { data: ghostProfiles, error } = await adminClient
    .from('ghost_profiles')
    .select('*')
    .order('last_purchase_date', { ascending: false })

  if (error) {
    console.error('Error fetching ghost profiles:', error)
    return <div>Error loading ghost profiles</div>
  }

  // Convert nullable fields to their non-null defaults
  const processedProfiles = (ghostProfiles || []).map(profile => ({
    ...profile,
    is_claimed: profile.is_claimed ?? false,
    is_visible: profile.is_visible ?? false,
    display_name: profile.display_name ?? 'Art Collector',
    total_purchases: profile.total_purchases ?? 0,
    total_spent: profile.total_spent ?? 0
  }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ghost Profiles</h1>
          <p className="text-muted-foreground">
            Manage guest purchaser profiles and their transactions
          </p>
        </div>
      </div>

      <GhostProfilesList 
        initialProfiles={processedProfiles}
        updateVisibility={updateGhostProfileVisibility}
        updateBatchVisibility={updateGhostProfilesBatchVisibility}
      />
    </div>
  )
} 