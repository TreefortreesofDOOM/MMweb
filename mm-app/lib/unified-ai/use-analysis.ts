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
  const { analysis } = useUnifiedAIContext()

  const analyze = async (type: typeof ANALYSIS_TYPES[number], content: string) => {
    try {
      // Check if we already have a pending or successful analysis for this type and content
      const existingAnalysis = analysis.find(a => 
        a.type === type && 
        a.content === content &&
        (a.status === 'pending' || a.status === 'success')
      )
      if (existingAnalysis) {
        console.log('Skipping duplicate analysis:', { type, status: existingAnalysis.status })
        return existingAnalysis
      }

      // Remove any existing analyses of this type
      const filteredAnalyses = analysis.filter(a => a.type !== type)
      filteredAnalyses.forEach(a => addAnalysis(a))

      console.log('Starting analysis:', type, content)
      setIsAnalyzing(true)
      setMode('analysis')

      const pendingAnalysis = createAnalysisResult(type, 'Analyzing...', 'pending')
      console.log('Adding pending analysis:', pendingAnalysis)
      addAnalysis(pendingAnalysis)

      let result: AnalysisResult
      
      // BIO EXTRACTION //
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

      // CONTENT ANALYSIS //
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

      // ARTWORK ANALYSIS //
      } else if (type.startsWith('artwork_')) {
        console.log('=== Starting artwork analysis in hook ===', { type })
        const response = await fetch('/api/ai/analyze-artwork', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageUrl: content,
            types: [type]
          })
        })
        
        if (!response.ok) {
          console.error('API request failed:', {
            status: response.status,
            statusText: response.statusText
          })
          throw new Error('Failed to analyze artwork')
        }

        const artworkResult = await response.json()
        console.log('=== Raw artwork analysis result ===', JSON.stringify(artworkResult, null, 2))
        
        if (artworkResult.error) {
          console.error('Analysis error:', artworkResult.error)
          throw new Error(artworkResult.error)
        }

        // Ensure we only have one result for this type
        const results = Array.isArray(artworkResult.results) ? artworkResult.results : [artworkResult]
        console.log('=== Parsed results array ===', results)
        
        // Find exact match for this type
        const matchingResult = results.find((r: { type: string; result: { summary: string; details: string[] } }) => r.type === type)
        console.log('=== Found matching result ===', matchingResult)
        
        if (!matchingResult) {
          throw new Error('No matching result found for type: ' + type)
        }
        
        result = createAnalysisResult(
          type,
          matchingResult.result.summary,
          'success'
        )
        result.results = matchingResult.result
        console.log('=== Final analysis result ===', {
          type,
          status: result.status,
          content: result.content,
          summary: result.results.summary,
          details: result.results.details
        })
        
        addAnalysis(result)
        onSuccess?.(result)
        return result

      // PORTFOLIO ANALYSIS //
      } else if (type.startsWith('portfolio_')) {
        console.log('=== useAnalysis: Starting portfolio analysis ===', { type })
        
        const response = await fetch('/api/ai/analyze-portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            portfolioData: content,
            analysisType: type 
          })
        })

        const result = await response.json()
        console.log('=== useAnalysis: Portfolio analysis result ===', result)

        if (!response.ok || result.status === 'error') {
          const errorMessage = result.content || 'Portfolio analysis failed'
          console.error('=== useAnalysis: Portfolio analysis failed ===', errorMessage)
          throw new Error(errorMessage)
        }

        return {
          type,
          content: result.content,
          timestamp: new Date().toISOString(),
          status: result.status,
          results: {
            summary: result.results?.summary || result.content,
            details: Array.isArray(result.results?.details) ? result.results.details : []
          }
        }

      // DEFAULT //
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