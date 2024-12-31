import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/supabase-server'
import type { Database } from '@/lib/database.types'

type UserRole = Database['public']['Enums']['user_role']

export default async function PortfolioPage() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error in portfolio redirect:', authError)
      throw redirect('/sign-in')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile in portfolio redirect:', profileError)
      throw redirect('/sign-in')
    }

    if (!profile) {
      console.log('No profile found in portfolio redirect')
      throw redirect('/sign-in')
    }

    // Check if user has any valid artist role
    const validArtistRoles: UserRole[] = ['artist', 'emerging_artist', 'verified_artist']
    if (!profile.role || !validArtistRoles.includes(profile.role as UserRole)) {
      console.log('Profile is not an artist:', {
        userId: user.id,
        role: profile.role
      })
      throw redirect('/')
    }

    console.log('Redirecting to artist portfolio:', {
      userId: user.id,
      role: profile.role
    })

    throw redirect(`/artists/${user.id}/portfolio`)
  } catch (error) {
    if ((error as any)?.digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Unexpected error in portfolio redirect:', error)
    throw redirect('/sign-in')
  }
} 