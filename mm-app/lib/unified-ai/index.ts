// Context
export {
  UnifiedAIContext,
  initialState,
  unifiedAIReducer,
  useUnifiedAI
} from './context'

// Hooks
export {
  useUnifiedAIActions,
  useUnifiedAIState,
  useUnifiedAIMode,
  useUnifiedAIVisibility,
  useUnifiedAIContext
} from './hooks'
export { useAnalysis } from './use-analysis'
export { useChat } from './use-chat'

// Utils
export {
  createMessage,
  createAnalysisResult,
  formatAnalysisType,
  getLastMessage,
  getLastAnalysis,
  isAnalysisInProgress,
  hasError,
  getErrorMessage
} from './utils'

// Types
export type {
  Message,
  AIMode,
  AnalysisResult,
  UnifiedAIState,
  UnifiedAIAction,
  UnifiedAIContextType,
  UnifiedAIProviderProps,
  UnifiedAIContainerProps,
  UnifiedAIButtonProps,
  UnifiedAIPanelProps,
  UnifiedAITransitionProps,
  UnifiedAIChatViewProps,
  UnifiedAIAnalysisViewProps
} from './types'

// Animations
export {
  ANIMATION_DURATION,
  fadeIn,
  slideIn,
  expand,
  breathe,
  pulse,
  spin,
  stagger
} from './animations' 