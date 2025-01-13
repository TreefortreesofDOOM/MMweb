'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useUnifiedAIContext, useUnifiedAIActions } from '@/lib/unified-ai/hooks'
import { useAnalysis } from '@/lib/unified-ai/use-analysis'
import { stagger, spin } from '@/lib/unified-ai/animations'
import { formatAnalysisType, isAnalysisInProgress, hasError, getErrorMessage } from '@/lib/unified-ai/utils'
import { ANALYSIS_TYPES, PORTFOLIO_ANALYSIS_TYPES } from '@/lib/unified-ai/types'
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
import { useContextAwareness } from '@/lib/unified-ai/hooks/use-context-awareness'

// Portfolio-specific result card component
const PortfolioResultCard = ({ result }: { result: AnalysisResult }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { state } = usePortfolioProgress()
  const analysis = state.analyses.find(a => a.type === result.type)

  const handleApply = () => {
    // Handle applying portfolio recommendations
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
            variant="outline"
            size="sm"
            className="gap-2"
          >
            Apply
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
  const context = useUnifiedAIContext()
  const { analysis } = context
  const { setMode } = useUnifiedAIActions()
  const { isAnalyzing, analyze } = useAnalysis()
  const { pageContext } = useContextAwareness()
  
  // Only use portfolio progress when on portfolio page
  const portfolioProgress = pageContext.pageType === 'portfolio' 
    ? usePortfolioProgress()
    : null

  // Filter analysis types based on current page
  const getVisibleAnalysisTypes = () => {
    const types = []

    // Bio extraction only on profile page
    if (pageContext.pageType === 'profile') {
      types.push('bio_extraction')
    }

    // Artwork analysis only on artwork pages
    if (pageContext.pageType === 'artwork') {
      types.push(
        'artwork_description',
        'artwork_style',
        'artwork_techniques',
        'artwork_keywords'
      )
    }

    // Portfolio analysis only on portfolio page
    if (pageContext.pageType === 'portfolio') {
      types.push(
        'portfolio_composition',
        'portfolio_presentation',
        'portfolio_pricing',
        'portfolio_market'
      )
    }

    // Analytics available everywhere
    types.push('analytics')

    return types
  }

  const visibleAnalysisTypes = getVisibleAnalysisTypes()

  const handleChatClick = () => {
    setMode('chat')
    onChatRequest?.()
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
        await analyze(type, `Sample ${type} content`)
      }
    } catch (err) {
      console.error(`Failed to perform ${type}:`, err)
      if (type.startsWith('portfolio_') && portfolioProgress) {
        portfolioProgress.setError(type as PortfolioAnalysisType, err instanceof Error ? err.message : 'An unknown error occurred')
      }
    }
  }

  const isLoading = isAnalysisInProgress(analysis)
  const showError = hasError(analysis)
  const errorMessage = getErrorMessage(analysis)

  const isPortfolioAnalysis = (type: string): type is PortfolioAnalysisType => {
    return PORTFOLIO_ANALYSIS_TYPES.includes(type as PortfolioAnalysisType)
  }

  return (
    <div className={cn('flex h-full flex-col space-y-4', className)}>
      {/* Analysis Actions */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={stagger.container}
        className="grid grid-cols-2 gap-2"
      >
        {ANALYSIS_TYPES
          .filter(type => visibleAnalysisTypes.includes(type))
          .map((type) => (
            <motion.div
              key={type}
              variants={stagger.item}
            >
              <Button
                variant="outline"
                onClick={() => handleAnalyze(type)}
                disabled={isAnalyzing}
                className="w-full text-sm"
              >
                {formatAnalysisType(type)}
              </Button>
            </motion.div>
          ))}
      </motion.div>

      {/* Overall Progress Bar for Portfolio Analysis */}
      {portfolioProgress && portfolioProgress.state.analyses.length > 0 && (
        <div className="space-y-2">
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
        className="flex-1 space-y-4 overflow-auto"
      >
        <AnimatePresence mode="popLayout">
          {analysis.map((result, index) => (
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
                // Original result card for non-portfolio analysis
                <Card className={cn(
                  'rounded-lg border border-border p-4',
                  result.status === 'pending' && 'animate-pulse bg-muted',
                  result.status === 'error' && 'border-destructive bg-destructive/10'
                )}>
                  <motion.div
                    layout
                    className="flex items-center justify-between"
                  >
                    <h3 className="font-medium">
                      {formatAnalysisType(result.type)}
                    </h3>
                    <StatusBadge status={
                      result.status === 'success' ? 'completed' : 
                      result.status as AnalysisStatus
                    } />
                  </motion.div>
                  <motion.p
                    layout
                    className={cn(
                      'mt-2',
                      result.status === 'error' && 'text-destructive'
                    )}
                  >
                    {result.content}
                  </motion.p>
                  {result.status === 'success' && onApplyResult && (
                    <motion.div
                      layout
                      className="mt-4 flex justify-end"
                    >
                      <Button
                        onClick={() => onApplyResult(result)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        Apply
                      </Button>
                    </motion.div>
                  )}
                </Card>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center py-4"
            >
              <LoadingSpinner className="h-6 w-6 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Actions */}
      <motion.div
        layout
        className="flex items-center justify-between space-x-4 border-t border-border pt-4"
      >
        <Button
          variant="outline"
          onClick={handleChatClick}
          disabled={isAnalyzing}
          className="flex-1"
        >
          Switch to Chat
        </Button>
      </motion.div>
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