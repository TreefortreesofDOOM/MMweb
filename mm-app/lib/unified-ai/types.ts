import { type ReactNode } from 'react'
import type { UserRole } from '@/lib/navigation/types'
import { PERSONALITIES } from '@/lib/ai/personalities'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export type AIMode = 'chat' | 'analysis'

// Assistant Personas with const assertion
export const ASSISTANT_PERSONAS = {
  CURATOR: 'curator',
  MENTOR: 'mentor',
  COLLECTOR: 'collector',
  ADVISOR: 'advisor'
} as const

export type AssistantPersona = typeof ASSISTANT_PERSONAS[keyof typeof ASSISTANT_PERSONAS]

// Role to Persona mapping with improved type safety
export const PERSONA_MAPPING = {
  admin: ASSISTANT_PERSONAS.ADVISOR,
  emerging_artist: ASSISTANT_PERSONAS.MENTOR,
  verified_artist: ASSISTANT_PERSONAS.MENTOR,
  patron: ASSISTANT_PERSONAS.COLLECTOR,
  user: ASSISTANT_PERSONAS.COLLECTOR
} as const

export type PersonaMappingType = typeof PERSONA_MAPPING

// Profile state with discriminated union
export interface ProfileLoading {
  status: 'loading'
}

export interface ProfileError {
  status: 'error'
  error: Error
}

export interface ProfileSuccess {
  status: 'success'
  data: {
    role: UserRole
    name: string | null | undefined
    bio: string | null | undefined
    website?: string | null
  }
}

export type ProfileState = ProfileLoading | ProfileError | ProfileSuccess

// Context types
export type ViewContext = 
  | 'general'
  | 'profile'
  | 'portfolio'
  | 'artwork'
  | 'analytics'
  | 'gallery'
  | 'store'
  | 'collection'

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
 * Context information about how the AI generated the content.
 * Contains both global AI settings and page-specific context.
 */
export interface AIContext {
  // Global AI settings
  model?: string
  prompt?: string
  parameters?: GenerationParameters
  negativePrompt?: string
  modelVersion?: string
  
  // Page-specific context (required for API calls and storage)
  route: string
  pageType: ViewContext
  persona: AssistantPersona
  personaContext?: string
  characterPersonality?: {
    name: string
    description: string
    traits: string[]
    speechPatterns: {
      greetings: string[]
      transitions: string[]
      closings: string[]
      fillers: string[]
      userAddressing: {
        named: string[]
        unnamed: string[]
      }
    }
    emotionalTone: {
      primary: string
      secondary: string[]
    }
    quirks?: {
      trigger: string
      responses: string[]
    }[]
    contextBehaviors?: {
      [key: string]: string
    }
  }
  data?: {
    websiteUrl?: string
    artworkCallbacks?: {
      onApplyDescription: (description: string) => void
      onApplyStyles: (styles: string[]) => void
      onApplyTechniques: (techniques: string[]) => void
      onApplyKeywords: (keywords: string[]) => void
    }
  }
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

/**
 * State for the UnifiedAI system.
 * Maintains conversation, analysis results, and current page context.
 */
export interface UnifiedAIState {
  mode: AIMode
  isOpen: boolean
  isMinimized: boolean
  isCollapsed: boolean
  context: {
    conversation: Message[]
    analysis: AnalysisResult[]
    pageContext: AIContext  // Full AIContext needed for API calls and storage
  }
}

export interface UnifiedAIAction {
  type: 'SET_MODE' | 'SET_OPEN' | 'SET_MINIMIZED' | 'ADD_MESSAGE' | 'ADD_ANALYSIS' | 'SET_PAGE_CONTEXT' | 'RESET'
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

export const CONTEXT_ANALYSIS_MAPPING: Record<ViewContext, AnalysisType[]> = {
  general: [],
  profile: ['bio_extraction'],
  portfolio: ['portfolio_composition', 'portfolio_presentation', 'portfolio_pricing', 'portfolio_market'],
  artwork: ['artwork_description', 'artwork_style', 'artwork_techniques', 'artwork_keywords'],
  analytics: ['analytics'],
  gallery: [],
  store: ['analytics'],
  collection: ['analytics']
} as const

export type PageContext = keyof typeof CONTEXT_ANALYSIS_MAPPING
export type AnalysisTypesByContext = typeof CONTEXT_ANALYSIS_MAPPING[PageContext]

// AI Personalities
export type AIPersonality = 'HAL9000' | 'GLADOS' | 'JARVIS' 

// Settings state with discriminated union
export interface SettingsLoading {
  status: 'loading'
}

export interface SettingsError {
  status: 'error'
  error: Error
}

export interface AIPreferences {
  aiPersonality: keyof typeof PERSONALITIES
  language?: string
  tone?: 'formal' | 'casual'
  responseLength?: 'concise' | 'detailed'
}

export interface SettingsSuccess {
  status: 'success'
  data: {
    preferences: AIPreferences
  }
}

export type SettingsState = SettingsLoading | SettingsError | SettingsSuccess

// Default AI settings
export const DEFAULT_AI_SETTINGS: AIPreferences = {
  aiPersonality: 'JARVIS',
  tone: 'formal',
  responseLength: 'concise'
} as const

// ... existing code ... 