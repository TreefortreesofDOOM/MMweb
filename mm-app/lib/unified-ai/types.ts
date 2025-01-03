import { type ReactNode } from 'react'
import type { UserRole } from '@/lib/navigation/types'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export type AIMode = 'chat' | 'analysis'

// Assistant Personas
export type AssistantPersona = 'curator' | 'mentor' | 'collector' | 'advisor'

// Role to Persona mapping
export const personaMapping: Record<UserRole, AssistantPersona> = {
  admin: 'advisor',
  emerging_artist: 'mentor',
  verified_artist: 'mentor',
  patron: 'collector',
  user: 'collector'
} as const

// Context types
export type ViewContext = 'profile' | 'artwork' | 'gallery' | 'general'

export type AIContext = {
  route: string
  pageType: ViewContext
  persona: AssistantPersona
  data?: {
    websiteUrl?: string
    artworkId?: string
    galleryId?: string
    profileId?: string
    personaContext?: string
    characterPersonality?: string
  }
}

export interface AnalysisResult {
  type: string
  content: string
  timestamp: string
  status: 'success' | 'error' | 'pending'
  source?: string
  error?: string
  results: {
    summary: string
    details: string[]
  }
}

export interface UnifiedAIState {
  mode: AIMode
  isOpen: boolean
  isMinimized: boolean
  context: {
    conversation: Message[]
    analysis: AnalysisResult[]
    pageContext: AIContext
  }
}

export interface UnifiedAIAction {
  type: 'SET_MODE' | 'SET_OPEN' | 'SET_MINIMIZED' | 'ADD_MESSAGE' | 'ADD_ANALYSIS' | 'RESET'
  payload?: any
}

export interface UnifiedAIContextType {
  state: UnifiedAIState
  dispatch: (action: UnifiedAIAction) => void
}

// Component Props
export interface UnifiedAIProviderProps {
  children: ReactNode
  initialState?: Partial<UnifiedAIState>
}

export interface UnifiedAIContainerProps {
  children?: ReactNode
  mode?: AIMode
  className?: string
}

export interface UnifiedAIButtonProps {
  className?: string
  'aria-label'?: string
  suggestedMode?: AIMode
}

export interface UnifiedAIPanelProps {
  children?: ReactNode
  className?: string
  onClose?: () => void
}

export interface UnifiedAITransitionProps {
  children: ReactNode
  show: boolean
  className?: string
}

export interface UnifiedAIChatViewProps {
  className?: string
  onAnalysisRequest?: () => void
}

export interface UnifiedAIAnalysisViewProps {
  className?: string
  onChatRequest?: () => void
  onApplyResult?: (result: AnalysisResult) => void
  websiteUrl?: string
}

export const ANALYSIS_TYPES = [
  'bio_extraction',
  'content_analysis',
  'style_analysis',
  'theme_analysis',
  'technical_analysis'
] as const

export type AnalysisType = typeof ANALYSIS_TYPES[number] 