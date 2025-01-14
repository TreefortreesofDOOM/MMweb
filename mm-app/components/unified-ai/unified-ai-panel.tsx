'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { slideIn } from '@/lib/unified-ai/animations'
import { useUnifiedAIMode } from '@/lib/unified-ai/hooks'
import type { UnifiedAIPanelProps } from '@/lib/unified-ai/types'

export const UnifiedAIPanel = ({
  children,
  className,
  onClose
}: UnifiedAIPanelProps) => {
  const mode = useUnifiedAIMode()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.()
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideIn}
      className={cn(
        'flex h-full w-full flex-col bg-background',
        className
      )}
      role="dialog"
      aria-label={`AI Assistant Panel - ${mode} mode`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">
          AI Assistant {mode === 'chat' ? 'Chat' : 'Analysis'}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </motion.div>
  )
} 