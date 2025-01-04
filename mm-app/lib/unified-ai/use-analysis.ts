'use client'

import { useState } from 'react'
import { useUnifiedAIActions, useUnifiedAIContext } from './hooks'
import { createAnalysisResult } from './utils'
import type { AnalysisResult } from './types'
import { ANALYSIS_TYPES } from './types'

interface UseAnalysisProps {
  onSuccess?: (result: AnalysisResult) => void
  onError?: (error: string) => void
}

export function useAnalysis({ onSuccess, onError }: UseAnalysisProps = {}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { addAnalysis, setMode } = useUnifiedAIActions()

  const analyze = async (type: typeof ANALYSIS_TYPES[number], content: string) => {
    try {
      console.log('Starting analysis:', type, content)
      setIsAnalyzing(true)
      setMode('analysis')

      const pendingAnalysis = createAnalysisResult(type, 'Analyzing...', 'pending')
      console.log('Adding pending analysis:', pendingAnalysis)
      addAnalysis(pendingAnalysis)

      let result: AnalysisResult
      
      if (type === 'bio_extraction') {
        const response = await fetch('/api/ai/extract-bio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ website: content })
        })
        
        if (!response.ok) {
          throw new Error('Failed to extract bio')
        }

        const bioResult = await response.json()
        console.log('Received bio result:', bioResult)
        
        result = createAnalysisResult(
          type,
          bioResult.bio || bioResult.error || 'No results',
          bioResult.status === 'success' ? 'success' : 'error'
        )
        result.results = {
          summary: bioResult.bio || bioResult.error || 'No results',
          details: []
        }
        console.log('Adding final analysis to context:', result)
        addAnalysis(result)
        onSuccess?.(result)
        return result
      } else if (type === 'analytics') {
        const response = await fetch('/api/ai/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: content })
        })
        
        if (!response.ok) {
          throw new Error('Failed to analyze data')
        }

        const analyticsResult = await response.json()
        console.log('Received analytics result:', analyticsResult)
        
        result = createAnalysisResult(
          type,
          JSON.stringify(analyticsResult.result, null, 2),
          'success'
        )
        result.results = {
          summary: analyticsResult.query,
          details: [
            `Function: ${analyticsResult.functionCall.functionName}`,
            `Parameters: ${JSON.stringify(analyticsResult.functionCall.parameters, null, 2)}`
          ]
        }
        console.log('Adding final analysis to context:', result)
        addAnalysis(result)
        onSuccess?.(result)
        return result
      } else {
        result = createAnalysisResult(
          type,
          `Sample ${type} analysis result`,
          'success'
        )
      }

      addAnalysis(result)
      onSuccess?.(result)
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      const errorResult = createAnalysisResult(type, errorMessage, 'error')
      addAnalysis(errorResult)
      onError?.(errorMessage)
      return errorResult
    } finally {
      setIsAnalyzing(false)
    }
  }

  return { isAnalyzing, analyze }
} 