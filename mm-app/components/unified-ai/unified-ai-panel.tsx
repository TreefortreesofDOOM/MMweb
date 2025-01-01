'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { slideIn } from '@/lib/unified-ai/animations'
import { useUnifiedAIMode, useUnifiedAIActions } from '@/lib/unified-ai/hooks'
import type { UnifiedAIPanelProps } from '@/lib/unified-ai/types'

export const UnifiedAIPanel = ({
  children,
  className,
  onClose
}: UnifiedAIPanelProps) => {
  const mode = useUnifiedAIMode()
  const { setOpen } = useUnifiedAIActions()

  const handleClose = () => {
    setOpen(false)
    onClose?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideIn}
      className={cn(
        'flex h-[600px] w-full flex-col rounded-lg bg-background shadow-lg',
        'border border-border',
        className
      )}
      role="dialog"
      aria-label={`AI Assistant Panel - ${mode} mode`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-lg font-semibold">
          AI Assistant {mode === 'chat' ? 'Chat' : 'Analysis'}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label="Close panel"
        >
          <CloseIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </motion.div>
  )
}

// Icon
const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
) 