'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUnifiedAIMode, useUnifiedAIActions, useUnifiedAIVisibility } from '@/lib/unified-ai/hooks'
import type { UnifiedAIButtonProps } from '@/lib/unified-ai/types'
import { MessageCircle } from 'lucide-react'

export const UnifiedAIButton = ({
  className,
  'aria-label': ariaLabel,
  suggestedMode = 'chat'
}: UnifiedAIButtonProps) => {
  const mode = useUnifiedAIMode()
  const { isOpen } = useUnifiedAIVisibility()
  const { setOpen, setMode } = useUnifiedAIActions()

  const handleClick = () => {
    if (!isOpen) {
      setMode(suggestedMode)
    }
    setOpen(!isOpen)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div className="absolute top-6 -left-8">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-l-full border border-r-0 bg-background shadow-md",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel || `Open AI Assistant (${mode} mode)`}
        tabIndex={0}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    </div>
  )
} 