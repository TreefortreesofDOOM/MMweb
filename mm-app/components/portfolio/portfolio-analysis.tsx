'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, ChevronUp, BarChart2, Layout, DollarSign, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PortfolioAnalysisType, PortfolioAnalysisResult } from '@/lib/ai'

interface PortfolioAnalysisProps {
  profileId: string
  onAnalysisComplete?: (results: PortfolioAnalysisResult[]) => void
}

const analysisTypeIcons = {
  portfolio_composition: BarChart2,
  portfolio_presentation: Layout,
  portfolio_pricing: DollarSign,
  portfolio_market: TrendingUp
} as const

const analysisTypes: PortfolioAnalysisType[] = [
  'portfolio_composition',
  'portfolio_presentation',
  'portfolio_pricing',
  'portfolio_market'
]

export function PortfolioAnalysis({ profileId, onAnalysisComplete }: PortfolioAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<PortfolioAnalysisResult[]>([])
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const handleAnalyze = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setResults([])
      setExpandedSections([])

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

      if (!response.ok) {
        throw new Error('Failed to analyze portfolio')
      }

      const data = await response.json()

      if (data.status === 'success' && data.results) {
        const analysisResults = data.results.map((r: any) => r.result)
        setResults(analysisResults)
        setExpandedSections([analysisResults[0]?.type])
        onAnalysisComplete?.(analysisResults)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (type: string) => {
    setExpandedSections(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const renderAnalysisCard = (type: PortfolioAnalysisType, result?: PortfolioAnalysisResult) => {
    const Icon = analysisTypeIcons[type]
    const isExpanded = expandedSections.includes(type)

    return (
      <Card key={type} className="overflow-hidden">
        <button
          onClick={() => result && toggleSection(type)}
          className="w-full text-left"
          disabled={!result}
        >
          <CardHeader className="flex flex-row items-center justify-between p-4 cursor-pointer hover:bg-accent/5">
            <div className="flex items-center space-x-3">
              <Icon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg capitalize">
                {type.replace('portfolio_', '')} Analysis
              </CardTitle>
            </div>
            {result && (isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />)}
          </CardHeader>
        </button>

        <AnimatePresence>
          {(isExpanded || isLoading) && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <CardContent className="p-4 pt-0">
                {isLoading ? (
                  <>
                    {/* Summary Skeleton */}
                    <div className="mb-6">
                      <h5 className="mb-2 text-sm font-medium text-muted-foreground">Summary</h5>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[90%]" />
                        <Skeleton className="h-4 w-[95%]" />
                      </div>
                    </div>

                    {/* Recommendations Skeleton */}
                    <div>
                      <h5 className="mb-3 text-sm font-medium text-muted-foreground">Recommendations</h5>
                      <ul className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start space-x-2"
                          >
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                              {i}
                            </span>
                            <Skeleton className="h-4 flex-1" />
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : result ? (
                  <>
                    {/* Summary */}
                    <div className="mb-6">
                      <h5 className="mb-2 text-sm font-medium text-muted-foreground">Summary</h5>
                      <p className="text-sm leading-relaxed">{result.summary}</p>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h5 className="mb-3 text-sm font-medium text-muted-foreground">Recommendations</h5>
                      <ul className="space-y-3">
                        {result.recommendations.map((recommendation, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-2 text-sm"
                          >
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                              {index + 1}
                            </span>
                            <span className="flex-1 leading-relaxed">{recommendation}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Analysis</CardTitle>
          <CardDescription>
            Get AI-powered insights about your portfolio's composition, presentation, pricing, and market position.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Portfolio...</span>
              </div>
            ) : (
              'Analyze Portfolio'
            )}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Cards */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          {analysisTypes.map(type => {
            const result = results.find(r => r.type === type)
            return renderAnalysisCard(type, result)
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
} 