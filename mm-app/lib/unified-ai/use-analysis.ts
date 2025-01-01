'use client'

import { useState, useCallback } from 'react'
import { useUnifiedAIActions } from './hooks'
import { createAnalysisResult } from './utils'
import type { AnalysisResult } from './types'

interface UseAnalysisProps {
  onSuccess?: (result: AnalysisResult) => void
  onError?: (error: string) => void
}

export function useAnalysis({ onSuccess, onError }: UseAnalysisProps = {}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { addAnalysis } = useUnifiedAIActions()

  const analyze = useCallback(async (type: string, content: string) => {
    try {
      setIsAnalyzing(true)

      // Add pending analysis
      const pendingAnalysis = createAnalysisResult(type, 'Analyzing...', 'pending')
      addAnalysis(pendingAnalysis)

      // TODO: Implement actual analysis logic here
      // For now, simulate analysis with a delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create success result
      const result = createAnalysisResult(type, content)
      addAnalysis(result)
      onSuccess?.(result)

      return result
    } catch (error) {
      // Create error result
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      const result = createAnalysisResult(type, errorMessage, 'error')
      addAnalysis(result)
      onError?.(errorMessage)

      return result
    } finally {
      setIsAnalyzing(false)
    }
  }, [addAnalysis, onSuccess, onError])

  return {
    isAnalyzing,
    analyze
  }
} 