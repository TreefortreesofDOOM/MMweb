'use client'

import { useReducer } from 'react'
import {
  UnifiedAIContext,
  initialState,
  unifiedAIReducer
} from '@/lib/unified-ai/context'
import type { UnifiedAIProviderProps } from '@/lib/unified-ai/types'

export const UnifiedAIProvider = ({
  children,
  initialState: customInitialState
}: UnifiedAIProviderProps) => {
  const [state, dispatch] = useReducer(
    unifiedAIReducer,
    customInitialState
      ? { ...initialState, ...customInitialState }
      : initialState
  )

  return (
    <UnifiedAIContext.Provider value={{ state, dispatch }}>
      {children}
    </UnifiedAIContext.Provider>
  )
} 