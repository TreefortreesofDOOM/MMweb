'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUnifiedAIContext, useUnifiedAIActions } from '@/lib/unified-ai/hooks'
import { useAnalysis } from '@/lib/unified-ai/use-analysis'
import { stagger, spin } from '@/lib/unified-ai/animations'
import { formatAnalysisType, isAnalysisInProgress, hasError, getErrorMessage } from '@/lib/unified-ai/utils'
import type { UnifiedAIAnalysisViewProps } from '@/lib/unified-ai/types'

const ANALYSIS_TYPES = [
  'content_analysis',
  'style_analysis',
  'theme_analysis',
  'technical_analysis'
] as const

export const UnifiedAIAnalysisView = ({
  className,
  onChatRequest
}: UnifiedAIAnalysisViewProps) => {
  const { analysis } = useUnifiedAIContext()
  const { setMode } = useUnifiedAIActions()
  const { isAnalyzing, analyze } = useAnalysis()

  const handleChatClick = () => {
    setMode('chat')
    onChatRequest?.()
  }

  const handleAnalyze = async (type: typeof ANALYSIS_TYPES[number]) => {
    try {
      await analyze(type, `Sample ${type} content`)
    } catch (error) {
      console.error(`Failed to perform ${type}:`, error)
    }
  }

  const isLoading = isAnalysisInProgress(analysis)
  const showError = hasError(analysis)
  const errorMessage = getErrorMessage(analysis)

  return (
    <div className={cn('flex h-full flex-col space-y-4', className)}>
      {/* Analysis Actions */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={stagger.container}
        className="grid grid-cols-2 gap-2"
      >
        {ANALYSIS_TYPES.map((type) => (
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
              className={cn(
                'rounded-lg border border-border p-4',
                result.status === 'pending' && 'animate-pulse bg-muted',
                result.status === 'error' && 'border-destructive bg-destructive/10'
              )}
            >
              <motion.div
                layout
                className="flex items-center justify-between"
              >
                <h3 className="font-medium">
                  {formatAnalysisType(result.type)}
                </h3>
                <StatusBadge status={result.status} />
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
const StatusBadge = ({ status }: { status: 'pending' | 'success' | 'error' }) => {
  const variants = {
    pending: 'bg-muted text-muted-foreground',
    success: 'bg-success/20 text-success',
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