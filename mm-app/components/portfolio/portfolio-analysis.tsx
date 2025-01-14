'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { PortfolioAnalysisType, PortfolioAnalysisResult } from '@/lib/ai'

interface PortfolioAnalysisProps {
  profileId: string
  onAnalysisComplete?: (results: PortfolioAnalysisResult[]) => void
}

export function PortfolioAnalysis({ profileId, onAnalysisComplete }: PortfolioAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<PortfolioAnalysisResult[]>([])

  const analysisTypes: PortfolioAnalysisType[] = [
    'portfolio_composition',
    'portfolio_presentation',
    'portfolio_pricing',
    'portfolio_market'
  ]

  const handleAnalyze = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setResults([])

      const response = await fetch('/api/ai/analyze-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          analysisTypes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze portfolio')
      }

      if (data.status === 'success' && data.results) {
        const analysisResults = data.results.map((r: any) => r.result)
        setResults(analysisResults)
        onAnalysisComplete?.(analysisResults)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Portfolio Analysis</h3>
          
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Portfolio'}
          </Button>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      </Card>

      {/* Results Display */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.type} className="p-4">
              <h4 className="mb-3 text-md font-medium capitalize">
                {result.type.replace('portfolio_', '')} Analysis
              </h4>
              
              <div className="space-y-4">
                {/* Summary */}
                <div>
                  <h5 className="mb-2 text-sm font-medium text-muted-foreground">Summary</h5>
                  <p className="text-sm">{result.summary}</p>
                </div>

                {/* Recommendations */}
                <div>
                  <h5 className="mb-2 text-sm font-medium text-muted-foreground">Recommendations</h5>
                  <ul className="space-y-2">
                    {result.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm">
                        • {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 