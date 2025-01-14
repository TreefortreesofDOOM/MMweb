'use client'

import { useCallback } from 'react'
import { useUnifiedAI } from './context'
import type { Message, AnalysisResult, AIMode } from './types'

export function useUnifiedAIActions() {
  const { dispatch } = useUnifiedAI()

  const setMode = useCallback((mode: AIMode) => {
    dispatch({ type: 'SET_MODE', payload: mode })
  }, [dispatch])

  const setOpen = useCallback((isOpen: boolean) => {
    dispatch({ type: 'SET_OPEN', payload: isOpen })
  }, [dispatch])

  const setMinimized = useCallback((isMinimized: boolean) => {
    dispatch({ type: 'SET_MINIMIZED', payload: isMinimized })
  }, [dispatch])

  const setCollapsed = useCallback((isCollapsed: boolean) => {
    dispatch({ type: 'SET_COLLAPSED', payload: isCollapsed })
  }, [dispatch])

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message })
  }, [dispatch])

  const addAnalysis = useCallback((analysis: AnalysisResult) => {
    dispatch({ type: 'ADD_ANALYSIS', payload: analysis })
  }, [dispatch])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [dispatch])

  return {
    setMode,
    setOpen,
    setMinimized,
    setCollapsed,
    addMessage,
    addAnalysis,
    reset
  }
}

export function useUnifiedAIState() {
  const { state } = useUnifiedAI()
  return state
}

export function useUnifiedAIMode() {
  const { state } = useUnifiedAI()
  return state.mode
}

export function useUnifiedAIVisibility() {
  const { state } = useUnifiedAI()
  return {
    isOpen: state.isOpen,
    isMinimized: state.isMinimized,
    isCollapsed: state.isCollapsed
  }
}

export function useUnifiedAIContext() {
  const { state } = useUnifiedAI()
  return state.context
} 