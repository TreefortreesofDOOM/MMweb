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
  artist: 'mentor',
  patron: 'collector',
  user: 'collector'
} as const

// Context types
export type ViewContext = 'general' | 'profile' | 'artwork' | 'gallery' | 'store' | 'collection' | 'portfolio'

/**
 * Parameters used for image generation
 */
export interface GenerationParameters {
  size?: '1024x1024' | '1024x1792' | '1792x1024'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  model?: 'dall-e-3' | 'dall-e-2'
  [key: string]: unknown // Allow for additional model-specific parameters
}

/**
 * Context information about how the AI generated the content
 */
export interface AIContext {
  route?: string
  pageType?: string
  persona?: string
  websiteUrl?: string
  artworkId?: string
  galleryId?: string
  profileId?: string
  personaContext?: string
  characterPersonality?: string
  data?: {
    websiteUrl?: string
    artworkCallbacks?: {
      onApplyDescription: (description: string) => void
      onApplyStyles: (styles: string[]) => void
      onApplyTechniques: (techniques: string[]) => void
      onApplyKeywords: (keywords: string[]) => void
    }
  }
  // Optional generation fields
  model?: string
  prompt?: string
  parameters?: GenerationParameters
  negativePrompt?: string
  modelVersion?: string
  [key: string]: unknown // Allow for additional context fields
}

/**
 * Metadata about the generated content
 */
export interface AIMetadata {
  confidence: number
  model: string
  generation: {
    prompt: string
    parameters: GenerationParameters
  }
  accessibility: {
    altText: string
    description: string
  }
  [key: string]: unknown // Allow for additional metadata
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
  'technical_analysis',
  'analytics',
  'artwork_description',
  'artwork_style',
  'artwork_techniques',
  'artwork_keywords',
  'portfolio_composition',
  'portfolio_presentation',
  'portfolio_pricing',
  'portfolio_market'
] as const

export type AnalysisType = typeof ANALYSIS_TYPES[number]

// Portfolio-specific types
export const PORTFOLIO_ANALYSIS_TYPES = [
  'portfolio_composition',
  'portfolio_presentation',
  'portfolio_pricing',
  'portfolio_market'
] as const

export type PortfolioAnalysisType = typeof PORTFOLIO_ANALYSIS_TYPES[number]

export interface PortfolioRecommendations {
  composition?: string[]
  presentation?: string[]
  pricing?: string[]
  market?: string[]
}

export interface PortfolioAnalysisResult {
  type: PortfolioAnalysisType
  recommendations: PortfolioRecommendations
  error?: string
} 