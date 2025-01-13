import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { type AIContext, type ViewContext, type AssistantPersona, personaMapping } from '../types'
import { useUnifiedAI } from '../context'
import { useAuth } from '@/hooks/use-auth'
import { PERSONALITIES, getPersonalizedContext } from '@/lib/ai/personalities'
import { getSettings } from '@/lib/actions/settings'
import type { UserRole } from '@/lib/navigation/types'

export const useContextAwareness = () => {
  const pathname = usePathname()
  const { state, dispatch } = useUnifiedAI()
  const { user } = useAuth()

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

      // Get persona based on user role
      const persona = user?.role ? personaMapping[user.role as UserRole] : personaMapping.user

      // Get user's preferred AI personality from settings
      const settings = await getSettings()
      const preferredCharacter = settings?.preferences.aiPersonality?.toUpperCase() || 'JARVIS'
      const characterPersonality = PERSONALITIES[preferredCharacter as keyof typeof PERSONALITIES]
      const rolePersonality = PERSONALITIES[persona.toUpperCase() as keyof typeof PERSONALITIES]

      // Combine context behaviors
      const personaContext = rolePersonality 
        ? getPersonalizedContext(rolePersonality, pageType)
        : getPersonalizedContext(characterPersonality, pageType)

      return {
        route: pathname,
        pageType,
        persona,
        personaContext,
        characterPersonality: characterPersonality.name,
        data: {
          ...contextData
        }
      }
    }

    // Update to handle async function
    determinePageContext().then(pageContext => {
      dispatch({
        type: 'SET_PAGE_CONTEXT',
        payload: pageContext
      })
    })

  }, [pathname, dispatch, user?.role, user?.id])

  const suggestAssistant = () => {
    switch (state.context.pageContext.pageType) {
      case 'profile':
        return {
          mode: 'analysis' as const,
          type: 'bio_extraction'
        }
      case 'portfolio':
        return {
          mode: 'analysis' as const,
          type: 'portfolio-analysis'
        }
      case 'artwork':
        return {
          mode: 'analysis' as const,
          type: 'artwork-analysis'  
        }
      case 'gallery':
        return {
          mode: 'chat' as const,
          type: 'gallery-assistant'
        }
      default:
        return {
          mode: 'chat' as const,
          type: 'general-assistant'
        }
    }
  }

  return {
    pageContext: state.context.pageContext,
    suggestedAssistant: suggestAssistant()
  }
} 