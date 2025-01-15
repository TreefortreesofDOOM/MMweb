'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useUnifiedAIContext, useUnifiedAIActions } from '@/lib/unified-ai/hooks'
import { useUnifiedAI } from '@/lib/unified-ai/context'
import { useAnalysis } from '@/lib/unified-ai/use-analysis'
import { stagger, spin } from '@/lib/unified-ai/animations'
import { formatAnalysisType, isAnalysisInProgress, hasError, getErrorMessage } from '@/lib/unified-ai/utils'
import { ANALYSIS_TYPES, CONTEXT_ANALYSIS_MAPPING, PORTFOLIO_ANALYSIS_TYPES } from '@/lib/unified-ai/types'
import { collectPortfolioData } from '@/lib/ai/portfolio-data-collector'
import { createBrowserClient } from '@/lib/supabase/supabase-client'
import { usePortfolioProgress } from '@/components/providers/portfolio-progress-provider'
import type { 
  UnifiedAIAnalysisViewProps, 
  AnalysisResult,
  AnalysisType,
  PortfolioAnalysisType
} from '@/lib/unified-ai/types'
import type { AnalysisStatus } from '@/components/providers/portfolio-progress-provider'
import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

// Portfolio-specific result card component
const PortfolioResultCard = ({ result }: { result: AnalysisResult }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const { state } = usePortfolioProgress()
  const analysis = state.analyses.find(a => a.type === result.type)

  const handleApply = () => {
    // Handle applying portfolio recommendations
    setIsApplied(true)
  }

  const handleExport = () => {
    // Handle exporting analysis results
  }

  const handleSave = () => {
    // Handle saving for comparison
  }

  return (
    <Card className={cn(
      'rounded-lg border border-border p-4',
      analysis?.status === 'pending' && 'animate-pulse bg-muted',
      analysis?.status === 'error' && 'border-destructive bg-destructive/10'
    )}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{formatAnalysisType(result.type)}</h3>
        <StatusBadge status={analysis?.status || 'pending'} />
      </div>
      
      {/* Progress indicator */}
      {analysis?.status === 'running' && (
        <Progress 
          value={analysis.progress} 
          className="mt-2 h-1"
        />
      )}
      
      <motion.div
        animate={{ height: isExpanded ? 'auto' : '100px' }}
        className="mt-2 overflow-hidden"
      >
        <p className={cn(
          'text-sm',
          analysis?.status === 'error' && 'text-destructive'
        )}>
          {result.content}
        </p>
        {result.results?.details && (
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {result.results.details.map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
        )}
      </motion.div>

      {analysis?.status === 'completed' && (
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            onClick={handleApply}
            variant={isApplied ? "default" : "outline"}
            size="sm"
            className="gap-2"
            disabled={isApplied}
          >
            {isApplied ? (
              <>
                <Check className="h-4 w-4" />
                Applied
              </>
            ) : (
              'Apply'
            )}
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            Export
          </Button>
          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            Save
          </Button>
        </div>
      )}

      {analysis?.error && (
        <div className="mt-2 rounded-lg border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
          {analysis.error}
        </div>
      )}
    </Card>
  )
}

export const UnifiedAIAnalysisView = ({
  className,
  onChatRequest,
  onApplyResult,
  websiteUrl
}: UnifiedAIAnalysisViewProps) => {
  const { state, dispatch } = useUnifiedAI()
  const { analysis, pageContext } = state.context
  const { setMode } = useUnifiedAIActions()
  const { isAnalyzing, analyze } = useAnalysis()
  const visibleAnalysisTypes = CONTEXT_ANALYSIS_MAPPING[pageContext.pageType] || []
  const [appliedResults, setAppliedResults] = useState<Record<string, boolean>>({})
  const [minimizedResults, setMinimizedResults] = useState<Record<string, boolean>>({})
  
  // Only use portfolio progress when on portfolio page
  const portfolioProgress = pageContext.pageType === 'portfolio' 
    ? usePortfolioProgress()
    : null

  const handleChatClick = () => {
    setMode('chat')
    onChatRequest?.()
  }

  const handleReset = () => {
    // Reset all states
    setAppliedResults({})
    setMinimizedResults({})
    // Clear analysis results from context
    dispatch({ type: 'RESET' })
  }

  const handleAnalyze = async (type: AnalysisType) => {
    try {
      const supabase = createBrowserClient()

      if (type === 'bio_extraction') {
        if (!websiteUrl) {
          throw new Error('No website URL provided')
        }
        await analyze(type, websiteUrl)
      } else if (type.startsWith('portfolio_')) {
        if (!pageContext.data || !('userId' in pageContext.data)) {
          throw new Error('No user ID provided')
        }
        
        if (!portfolioProgress) {
          throw new Error('Portfolio progress tracking is not available')
        }

        // Start tracking this analysis
        portfolioProgress.startAnalysis(type as PortfolioAnalysisType)
        portfolioProgress.updateProgress(type as PortfolioAnalysisType, 10)
        
        // Collect portfolio data
        const userId = pageContext.data.userId as string
        const portfolioData = await collectPortfolioData(userId)
        portfolioProgress.updateProgress(type as PortfolioAnalysisType, 40)
        
        // Analyze the data
        await analyze(type, JSON.stringify(portfolioData))
        portfolioProgress.updateProgress(type as PortfolioAnalysisType, 90)
        
        // Mark as complete
        portfolioProgress.completeAnalysis(type as PortfolioAnalysisType)
      } else {
        throw new Error('No content available for analysis')
      }
    } catch (err) {
      console.error(`Failed to perform ${type}:`, err)
      if (type.startsWith('portfolio_') && portfolioProgress) {
        portfolioProgress.setError(type as PortfolioAnalysisType, err instanceof Error ? err.message : 'An unknown error occurred')
      }
    }
  }

  const handleApplyResult = (result: AnalysisResult) => {
    onApplyResult?.(result)
    setAppliedResults(prev => ({
      ...prev,
      [result.type]: true
    }))
    // Minimize the card after applying
    setMinimizedResults(prev => ({
      ...prev,
      [result.type]: true
    }))
  }

  const toggleMinimized = (type: string) => {
    setMinimizedResults(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const isPortfolioAnalysis = (type: string): type is PortfolioAnalysisType => {
    return PORTFOLIO_ANALYSIS_TYPES.includes(type as PortfolioAnalysisType)
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {visibleAnalysisTypes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No analysis features available for this page.</p>
            <p className="text-sm text-muted-foreground">
              Try visiting an{' '}
              <Link href="/artwork/create" className="text-primary hover:underline">artwork</Link>,{' '}
              <Link href="/profile" className="text-primary hover:underline">profile</Link>, or{' '}
              <Link href="/portfolio" className="text-primary hover:underline">portfolio</Link>{' '}
              page to access AI analysis tools.
            </p>
          </div>
        </div>
      ): (
        <>
          {/* Analysis Actions */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger.container}
            className="space-y-4"
          >
            {/* Helper Messages */}
            {visibleAnalysisTypes.some((type: AnalysisType) => type.startsWith('artwork_')) && 
             !pageContext.data?.artworkCallbacks && (
              <div className="text-sm text-muted-foreground text-center bg-muted/50 rounded-lg p-2">
                Please upload an artwork to enable analysis options
              </div>
            )}
            
            {visibleAnalysisTypes.includes('bio_extraction') && 
             !websiteUrl && (
              <div className="text-sm text-muted-foreground text-center bg-muted/50 rounded-lg p-2">
                Please add your website URL in profile settings to enable bio extraction
              </div>
            )}
            
            {/* Analysis Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {ANALYSIS_TYPES
                .filter(type => visibleAnalysisTypes.includes(type))
                .map((type) => {
                  // Check if artwork analysis and if artwork is available
                  const isArtworkAnalysis = type.startsWith('artwork_')
                  const artworkAvailable = isArtworkAnalysis ? Boolean(pageContext.data?.artworkCallbacks) : true

                  // Check if bio extraction and if website URL is available
                  const isBioExtraction = type === 'bio_extraction'
                  const websiteAvailable = isBioExtraction ? Boolean(websiteUrl) : true

                  return (
                    <motion.div
                      key={type}
                      variants={stagger.item}
                    >
                      <Button
                        variant="outline"
                        onClick={() => handleAnalyze(type)}
                        disabled={isAnalyzing || 
                          (isArtworkAnalysis && !artworkAvailable) ||
                          (isBioExtraction && !websiteAvailable)
                        }
                        className="w-full"
                        title={
                          isArtworkAnalysis && !artworkAvailable ? "Please upload an artwork first" :
                          isBioExtraction && !websiteAvailable ? "Please add your website URL in profile settings" :
                          undefined
                        }
                      >
                        {formatAnalysisType(type)}
                      </Button>
                    </motion.div>
                  )
                })}
            </div>
          </motion.div>

          {/* Overall Progress Bar for Portfolio Analysis */}
          {portfolioProgress && portfolioProgress.state.analyses.length > 0 && (
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(portfolioProgress.state.overallProgress)}%
                </span>
              </div>
              <Progress value={portfolioProgress.state.overallProgress} className="h-2" />
            </div>
          )}

          {/* Analysis Results */}
          <motion.div
            layout
            className="flex-1 space-y-4 overflow-auto mt-6 border-t border-border pt-6"
          >
            {analysis.length > 0 && (
              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  Clear Results
                </Button>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {[...analysis].reverse().map((result, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {isPortfolioAnalysis(result.type) ? (
                    <PortfolioResultCard result={result} />
                  ) : (
                    <Card className="rounded-lg border border-border p-4">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleMinimized(result.type)}
                      >
                        <h3 className="font-medium">{formatAnalysisType(result.type)}</h3>
                        {result.status === 'success' && appliedResults[result.type] && (
                          <Badge variant="default" className="gap-1">
                            <Check className="h-3 w-3" />
                            Applied
                          </Badge>
                        )}
                      </div>
                      
                      <motion.div
                        animate={{ height: minimizedResults[result.type] ? 0 : 'auto' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2">
                          <p className="text-sm">{result.content}</p>
                          {result.results?.details && (
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                              {result.results.details.map((detail, i) => (
                                <li key={i}>{detail}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {result.status === 'success' && onApplyResult && !appliedResults[result.type] && (
                          <div className="mt-4 flex justify-end">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApplyResult(result)
                              }}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              Apply
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    </Card>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  )
}

// Components
const StatusBadge = ({ status }: { status: AnalysisStatus }) => {
  const variants: Record<AnalysisStatus, string> = {
    pending: 'bg-muted text-muted-foreground',
    running: 'bg-primary/20 text-primary',
    completed: 'bg-success/20 text-success',
    error: 'bg-destructive/20 text-destructive'
  }

  return (
    <motion.span
      layout
      className={cn(
        'rounded-full px-2 py-1 text-xs font-medium',
        variants[status]
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  )
}

const LoadingSpinner = ({ className }: { className?: string }) => (
  <motion.svg
    variants={spin}
    initial="initial"
    animate="animate"
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </motion.svg>
)