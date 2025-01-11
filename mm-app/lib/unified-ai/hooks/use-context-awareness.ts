import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { type AIContext, type ViewContext, type AssistantPersona, personaMapping } from '../types'
import { useUnifiedAI } from '../context'
import { useAuth } from '@/hooks/use-auth'
import { PERSONALITIES, getPersonalizedContext } from '@/lib/ai/personalities'
import type { UserRole } from '@/lib/navigation/types'

export const useContextAwareness = () => {
  const pathname = usePathname()
  const { state, dispatch } = useUnifiedAI()
  const { user } = useAuth()

  useEffect(() => {
    const determinePageContext = (): AIContext => {
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

      // Get persona based on user role
      const persona = user?.role ? personaMapping[user.role as UserRole] : personaMapping.user

      // Get both character and role personalities
      const characterPersonality = PERSONALITIES.JARVIS // Default character personality
      const rolePersonality = PERSONALITIES[persona.toUpperCase() as keyof typeof PERSONALITIES]

      // Combine context behaviors
      const personaContext = rolePersonality 
        ? getPersonalizedContext(rolePersonality, pageType)
        : characterPersonality.contextBehaviors[pageType] || 
          characterPersonality.contextBehaviors.general || 
          'Consider the context and purpose of what you are viewing.'

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

    const pageContext = determinePageContext()
    
    dispatch({
      type: 'SET_PAGE_CONTEXT',
      payload: pageContext
    })

  }, [pathname, dispatch, user?.role])

  const suggestAssistant = () => {
    switch (state.context.pageContext.pageType) {
      case 'profile':
        return {
          mode: 'analysis' as const,
          type: 'bio_extraction'
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

  const getPersonaContext = (persona: AssistantPersona, pageType: ViewContext): string => {
    switch (persona) {
      case 'collector':
        switch (pageType) {
          case 'artwork':
            return 'You are viewing an artwork as a collector. Focus on its collectible value, market position, and how it might fit into a collection.';
          case 'gallery':
            return 'You are browsing a gallery as a collector. Consider the curation, themes, and potential additions to your collection.';
          case 'profile':
            return 'You are viewing an artist profile as a collector. Focus on their career trajectory, body of work, and collecting opportunities.';
          default:
            return 'You are exploring as a collector. Consider market trends, collecting strategies, and portfolio development.';
        }

      case 'mentor':
        switch (pageType) {
          case 'artwork':
            return 'You are reviewing artwork as a mentor. Focus on artistic technique, composition, and potential improvements.';
          case 'gallery':
            return 'You are exploring gallery space as a mentor. Consider presentation, curation, and exhibition strategies.';
          case 'profile':
            return 'You are reviewing an artist profile as a mentor. Focus on portfolio development, career growth, and professional presentation.';
          default:
            return 'You are mentoring artists. Consider career development, artistic growth, and professional opportunities.';
        }

      case 'advisor':
        switch (pageType) {
          case 'artwork':
            return 'You are analyzing artwork as an advisor. Focus on market trends, platform metrics, and engagement analytics.';
          case 'gallery':
            return 'You are analyzing gallery performance as an advisor. Consider traffic patterns, conversion rates, and user engagement.';
          case 'profile':
            return 'You are reviewing profile metrics as an advisor. Focus on visibility, engagement rates, and growth opportunities.';
          default:
            return 'You are providing strategic insights. Consider platform metrics, user behavior, and growth opportunities.';
        }

      default:
        return 'You are exploring content. Consider the context and purpose of what you are viewing.';
    }
  };

  return {
    pageContext: state.context.pageContext,
    suggestedAssistant: suggestAssistant()
  }
} 