'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import type { PortfolioAnalysisType } from '@/lib/ai/portfolio-types'

export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'error'

interface AnalysisProgress {
  type: PortfolioAnalysisType
  progress: number
  status: AnalysisStatus
  error?: string
}

interface ProgressState {
  overallProgress: number
  analyses: AnalysisProgress[]
  isCancelled: boolean
  isComplete: boolean
}

type ProgressAction = 
  | { type: 'START_ANALYSIS'; payload: PortfolioAnalysisType }
  | { type: 'UPDATE_PROGRESS'; payload: { type: PortfolioAnalysisType; progress: number } }
  | { type: 'COMPLETE_ANALYSIS'; payload: PortfolioAnalysisType }
  | { type: 'SET_ERROR'; payload: { type: PortfolioAnalysisType; error: string } }
  | { type: 'CANCEL_ALL' }
  | { type: 'RESET' }

const initialState: ProgressState = {
  overallProgress: 0,
  analyses: [],
  isCancelled: false,
  isComplete: false
}

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'START_ANALYSIS':
      return {
        ...state,
        analyses: [
          ...state.analyses,
          { type: action.payload, progress: 0, status: 'pending' as AnalysisStatus }
        ]
      }

    case 'UPDATE_PROGRESS': {
      const updatedAnalyses = state.analyses.map(analysis => 
        analysis.type === action.payload.type
          ? { ...analysis, progress: action.payload.progress, status: 'running' as AnalysisStatus }
          : analysis
      )
      
      // Calculate overall progress
      const overallProgress = updatedAnalyses.reduce(
        (sum, analysis) => sum + analysis.progress,
        0
      ) / updatedAnalyses.length

      return {
        ...state,
        analyses: updatedAnalyses,
        overallProgress
      }
    }

    case 'COMPLETE_ANALYSIS': {
      const updatedAnalyses = state.analyses.map(analysis =>
        analysis.type === action.payload
          ? { ...analysis, progress: 100, status: 'completed' as AnalysisStatus }
          : analysis
      )

      const isComplete = updatedAnalyses.every(
        analysis => analysis.status === 'completed'
      )

      return {
        ...state,
        analyses: updatedAnalyses,
        isComplete,
        overallProgress: isComplete ? 100 : state.overallProgress
      }
    }

    case 'SET_ERROR':
      return {
        ...state,
        analyses: state.analyses.map(analysis =>
          analysis.type === action.payload.type
            ? { ...analysis, status: 'error' as AnalysisStatus, error: action.payload.error }
            : analysis
        )
      }

    case 'CANCEL_ALL':
      return {
        ...state,
        isCancelled: true
      }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

const PortfolioProgressContext = createContext<{
  state: ProgressState
  startAnalysis: (type: PortfolioAnalysisType) => void
  updateProgress: (type: PortfolioAnalysisType, progress: number) => void
  completeAnalysis: (type: PortfolioAnalysisType) => void
  setError: (type: PortfolioAnalysisType, error: string) => void
  cancelAll: () => void
  reset: () => void
} | null>(null)

export function PortfolioProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, initialState)

  const startAnalysis = (type: PortfolioAnalysisType) => {
    dispatch({ type: 'START_ANALYSIS', payload: type })
  }

  const updateProgress = (type: PortfolioAnalysisType, progress: number) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: { type, progress } })
  }

  const completeAnalysis = (type: PortfolioAnalysisType) => {
    dispatch({ type: 'COMPLETE_ANALYSIS', payload: type })
  }

  const setError = (type: PortfolioAnalysisType, error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { type, error } })
  }

  const cancelAll = () => {
    dispatch({ type: 'CANCEL_ALL' })
  }

  const reset = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <PortfolioProgressContext.Provider value={{
      state,
      startAnalysis,
      updateProgress,
      completeAnalysis,
      setError,
      cancelAll,
      reset
    }}>
      {children}
    </PortfolioProgressContext.Provider>
  )
}

export function usePortfolioProgress() {
  const context = useContext(PortfolioProgressContext)
  if (!context) {
    throw new Error('usePortfolioProgress must be used within a PortfolioProgressProvider')
  }
  return context
} 