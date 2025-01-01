'use client'

import * as React from 'react'
import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react'
import type { AIMode, UnifiedAIState, Message, AnalysisResult, AIContext } from './types'

type UnifiedAIAction = 
  | { type: 'SET_MODE'; payload: AIMode }
  | { type: 'SET_OPEN'; payload: boolean }
  | { type: 'SET_MINIMIZED'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'ADD_ANALYSIS'; payload: AnalysisResult }
  | { type: 'SET_PAGE_CONTEXT'; payload: AIContext }
  | { type: 'RESET' }

const initialState: UnifiedAIState = {
  mode: 'chat',
  isOpen: false,
  isMinimized: false,
  context: {
    conversation: [],
    analysis: [],
    pageContext: {
      route: '/',
      pageType: 'general'
    }
  }
}

function unifiedAIReducer(state: UnifiedAIState, action: UnifiedAIAction): UnifiedAIState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload }
    case 'SET_OPEN':
      return { ...state, isOpen: action.payload }
    case 'SET_MINIMIZED':
      return { ...state, isMinimized: action.payload }
    case 'ADD_MESSAGE':
      return {
        ...state,
        context: {
          ...state.context,
          conversation: [...state.context.conversation, action.payload]
        }
      }
    case 'ADD_ANALYSIS':
      return {
        ...state,
        context: {
          ...state.context,
          analysis: [...state.context.analysis, action.payload]
        }
      }
    case 'SET_PAGE_CONTEXT':
      return {
        ...state,
        context: {
          ...state.context,
          pageContext: action.payload
        }
      }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

type UnifiedAIContextType = {
  state: UnifiedAIState
  dispatch: Dispatch<UnifiedAIAction>
}

const UnifiedAIContext = createContext<UnifiedAIContextType | undefined>(undefined)

interface ProviderProps {
  children: ReactNode
}

export function UnifiedAIProvider({ children }: ProviderProps) {
  const [state, dispatch] = useReducer(unifiedAIReducer, initialState)
  const value = { state, dispatch }
  
  return (
    <UnifiedAIContext.Provider value={value}>
      {children}
    </UnifiedAIContext.Provider>
  )
}

export function useUnifiedAI() {
  const context = useContext(UnifiedAIContext)
  if (!context) {
    throw new Error('useUnifiedAI must be used within a UnifiedAIProvider')
  }
  return context
}

export { UnifiedAIContext, initialState, unifiedAIReducer } 