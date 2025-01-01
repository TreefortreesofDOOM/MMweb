import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { type AIContext } from '../types'
import { useUnifiedAI } from '../context'

export const useContextAwareness = () => {
  const pathname = usePathname()
  const { state, dispatch } = useUnifiedAI()

  useEffect(() => {
    const determinePageContext = (): AIContext => {
      // Profile pages
      if (pathname.includes('/profile')) {
        return {
          route: pathname,
          pageType: 'profile',
          data: {
            profileId: pathname.split('/').pop()
          }
        }
      }
      
      // Artwork pages
      if (pathname.includes('/artwork')) {
        return {
          route: pathname,
          pageType: 'artwork',
          data: {
            artworkId: pathname.split('/').pop()
          }
        }
      }

      // Gallery pages
      if (pathname.includes('/gallery')) {
        return {
          route: pathname,
          pageType: 'gallery',
          data: {
            galleryId: pathname.split('/').pop()
          }
        }
      }

      // Default context
      return {
        route: pathname,
        pageType: 'general'
      }
    }

    const pageContext = determinePageContext()
    
    dispatch({
      type: 'SET_PAGE_CONTEXT',
      payload: pageContext
    })

  }, [pathname, dispatch])

  const suggestAssistant = () => {
    switch (state.context.pageContext.pageType) {
      case 'profile':
        return {
          mode: 'analysis' as const,
          type: 'bio-extraction'
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