'use client'

import { motion, type Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUnifiedAIMode, useUnifiedAIActions } from '@/lib/unified-ai/hooks'
import type { UnifiedAIButtonProps } from '@/lib/unified-ai/types'

const breatheAnimation: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: 1.05,
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
}

export const UnifiedAIButton = ({
  className,
  'aria-label': ariaLabel,
  suggestedMode = 'analysis'
}: UnifiedAIButtonProps) => {
  const mode = useUnifiedAIMode()
  const { setOpen, setMode } = useUnifiedAIActions()

  const handleClick = () => {
    setMode(suggestedMode)
    setOpen(true)
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={breatheAnimation}
      className={cn('fixed bottom-4 right-4 z-50', className)}
    >
      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel || `Open AI Assistant (${mode} mode)`}
        tabIndex={0}
      >
        <span className="sr-only">Open AI Assistant</span>
        {/* Icon based on mode */}
        {mode === 'chat' ? (
          <MessageCircleIcon className="h-6 w-6" />
        ) : (
          <SearchIcon className="h-6 w-6" />
        )}
      </Button>
    </motion.div>
  )
}

// Icons
const MessageCircleIcon = ({ className }: { className?: string }) => (
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
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const SearchIcon = ({ className }: { className?: string }) => (
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
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
) 