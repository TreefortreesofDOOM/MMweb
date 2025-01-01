import { type ReactNode } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export type AIMode = 'chat' | 'analysis'

export type AIContext = {
  route: string
  pageType: 'profile' | 'artwork' | 'gallery' | 'general'
  data?: {
    websiteUrl?: string
    artworkId?: string
    galleryId?: string
    profileId?: string
  }
}

export interface AnalysisResult {
  type: string
  content: string
  timestamp: number
  status: 'pending' | 'success' | 'error'
  error?: string
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
} 