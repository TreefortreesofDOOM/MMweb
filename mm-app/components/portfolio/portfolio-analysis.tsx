'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useAnalysis } from '@/lib/unified-ai/use-analysis'
import { createBrowserClient } from '@/lib/supabase/supabase-client'
import { collectPortfolioData } from '@/lib/ai/portfolio-data-collector'
import { PORTFOLIO_ANALYSIS_TYPES } from '@/lib/unified-ai/types'
import type { 
  PortfolioAnalysisResult, 
  PortfolioRecommendations,
  PortfolioAnalysisType
} from '@/lib/unified-ai/types'

interface PortfolioAnalysisProps {
  userId: string
  mode?: 'create' | 'edit'
  existingAnalysis?: PortfolioAnalysisResult
  onApplyRecommendations?: (recommendations: PortfolioRecommendations) => void
}

// Analysis result type
interface AnalysisResultWithRecommendations {
  type: PortfolioAnalysisType
  content: string
  timestamp: string
  status: 'success' | 'error' | 'pending'
  error?: string
  recommendations: string[]
}

export function PortfolioAnalysis({
  userId,
  mode = 'create',
  existingAnalysis,
  onApplyRecommendations
}: PortfolioAnalysisProps) {
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResultWithRecommendations[]>([])
  const { isAnalyzing, analyze } = useAnalysis({
    onError: (error) => setError(error)
  })

  const handleStartAnalysis = async () => {
    try {
      setError(null)
      setProgress(0)
      setAnalysisResults([])

      // Initialize Supabase client
      const supabase = createBrowserClient()

      // Collect portfolio data
      const portfolioData = await collectPortfolioData(userId)
      setProgress(25) // Data collection complete

      // Run analyses in parallel
      const analysisPromises = PORTFOLIO_ANALYSIS_TYPES.map(async (type) => {
        const result = await analyze(type, JSON.stringify(portfolioData))
        setProgress(prev => prev + (75 / PORTFOLIO_ANALYSIS_TYPES.length))
        return {
          ...result,
          type,
          recommendations: result.results?.details || []
        } as AnalysisResultWithRecommendations
      })

      const results = await Promise.all(analysisPromises)
      setAnalysisResults(results)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze portfolio')
      console.error('Portfolio analysis error:', err)
    }
  }

  const handleRetry = () => {
    handleStartAnalysis()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Portfolio Analysis</h2>
        <Button
          onClick={handleStartAnalysis}
          disabled={isAnalyzing}
          className="gap-2"
        >
          {isAnalyzing ? 'Analyzing...' : mode === 'create' ? 'Start Analysis' : 'Update Analysis'}
        </Button>
      </div>

      {/* Progress Tracking */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span>Analyzing portfolio...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/10 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Results Display */}
      <div className="grid gap-6 md:grid-cols-2">
        {analysisResults.map((result, index) => (
          <PortfolioAnalysisCard
            key={index}
            result={result}
            onApply={onApplyRecommendations}
          />
        ))}
      </div>
    </div>
  )
}

// Update PortfolioAnalysisCard props
interface PortfolioAnalysisCardProps {
  result: AnalysisResultWithRecommendations
  onApply?: (recommendations: PortfolioRecommendations) => void
}

function PortfolioAnalysisCard({ result, onApply }: PortfolioAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleApply = () => {
    if (onApply && result.recommendations) {
      // Convert string array to PortfolioRecommendations format
      const recommendationType = result.type.replace('portfolio_', '') as keyof PortfolioRecommendations
      onApply({
        [recommendationType]: result.recommendations
      } as PortfolioRecommendations)
    }
  }

  return (
    <Card className="overflow-hidden">
      <motion.div
        animate={{ height: isExpanded ? 'auto' : '12rem' }}
        className="p-4"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium">{result.type}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Summary */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Summary</h4>
            <p className="text-sm">{result.content}</p>
          </div>

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">Recommendations</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm">
                {result.recommendations.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex justify-end border-t border-border bg-muted/50 p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleApply}
          disabled={!result.recommendations || result.recommendations.length === 0}
        >
          Apply Recommendations
        </Button>
      </div>
    </Card>
  )
} 