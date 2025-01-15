import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { 
  type AIContext,
  type ViewContext, 
  type AssistantPersona,
  type ProfileState,
  PERSONA_MAPPING,
  ASSISTANT_PERSONAS,
  CONTEXT_ANALYSIS_MAPPING
} from '../types'
import { useUnifiedAI } from '../context'
import { useAuth } from '@/hooks/use-auth'
import { PERSONALITIES, getPersonalizedContext } from '@/lib/ai/personalities'
import { getSettings } from '@/lib/actions/settings'
import type { UserRole } from '@/lib/navigation/types'

export const useContextAwareness = () => {
  const pathname = usePathname()
  const { state, dispatch } = useUnifiedAI()
  const { user, profile, isLoaded } = useAuth()

  useEffect(() => {
    const determinePageContext = async (): Promise<AIContext> => {
      // Get view context
      let pageType: ViewContext = 'general'
      let contextData = {}

      // Profile pages
      if (pathname.includes('/profile')) {
        pageType = 'profile'
        contextData = {
          profileId: pathname.split('/').pop()
        }
      }
      
      // Portfolio pages
      if (pathname.includes('/portfolio')) {
        pageType = 'portfolio'
        contextData = {
          userId: user?.id,
          isOwner: true
        }
      }

      // Artwork pages
      if (pathname.includes('/artwork')) {
        pageType = 'artwork'
        contextData = {
          artworkId: pathname.split('/').pop()
        }
      }

      // Gallery pages
      if (pathname.includes('/gallery')) {
        pageType = 'gallery'
        contextData = {
          galleryId: pathname.split('/').pop()
        }
      }

      // Store pages
      if (pathname.includes('/store')) {
        pageType = 'store'
        contextData = {
          storeId: pathname.split('/').pop(),
          isProductPage: pathname.includes('/products/')
        }
      }

      // Collections pages
      if (pathname.includes('/collections')) {
        pageType = 'collection'
        contextData = {
          collectionId: pathname.split('/').pop(),
          isPrivate: pathname.includes('/private/')
        }
      }

      // Wait for auth to be loaded
      if (!isLoaded) {
        console.log('Waiting for auth to load...')
        return state.context.pageContext
      }

      // Debug log profile and role
      console.log('Profile:', profile)
      console.log('Profile Role:', profile?.role)

      // Get persona based on profile role (source of truth)
      const persona = profile?.role ? PERSONA_MAPPING[profile.role as UserRole] : PERSONA_MAPPING.user
      console.log('Mapped Persona:', persona)

      // Get user's preferred AI personality from settings
      const settings = await getSettings()
      console.log('Settings:', settings)
      console.log('AI Preferences:', settings?.preferences?.aiPersonality)

      const preferredCharacter = settings?.preferences?.aiPersonality || 'JARVIS'
      console.log('Preferred Character:', preferredCharacter)

      const characterPersonality = PERSONALITIES[preferredCharacter as keyof typeof PERSONALITIES]
      console.log('Character Personality:', characterPersonality)

      const rolePersonality = persona ? PERSONALITIES[persona.toUpperCase() as keyof typeof PERSONALITIES] : null
      console.log('Role Personality:', rolePersonality)

      // Combine context behaviors
      const personaContext = rolePersonality 
        ? getPersonalizedContext(rolePersonality, pageType)
        : getPersonalizedContext(characterPersonality, pageType)

      return {
        route: pathname,
        pageType,
        persona,
        personaContext,
        characterPersonality,
        data: contextData
      }
    }

    // Update context when pathname or auth changes
    determinePageContext().then(context => {
      console.log('Dispatching context update:', context)
      dispatch({ type: 'SET_PAGE_CONTEXT', payload: context })
    })
  }, [pathname, dispatch, user?.id, profile?.role, isLoaded])

  return state.context.pageContext
} 