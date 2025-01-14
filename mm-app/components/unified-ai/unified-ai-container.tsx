'use client'

import { cn } from '@/lib/utils'
import { useUnifiedAIMode, useUnifiedAIVisibility, useUnifiedAIActions } from '@/lib/unified-ai/hooks'
import type { UnifiedAIContainerProps } from '@/lib/unified-ai/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const UnifiedAIContainer = ({
  children,
  mode: forcedMode,
  className
}: UnifiedAIContainerProps) => {
  const currentMode = useUnifiedAIMode()
  const { isOpen, isCollapsed } = useUnifiedAIVisibility()
  const { setOpen, setCollapsed } = useUnifiedAIActions()
  const mode = forcedMode || currentMode

  const handleToggle = () => {
    setCollapsed(!isCollapsed)
  }

  return (
    <div
      className={cn(
        'absolute top-0 right-0 h-[calc(100vh-4rem)] flex flex-col bg-background transition-all duration-200 ease-in-out',
        isOpen && 'border-l',
        isOpen && !isCollapsed && 'w-[400px]',
        isOpen && isCollapsed && 'w-16',
        !isOpen && 'w-0',
        className
      )}
      role="complementary"
      aria-label={`AI Assistant - ${mode} mode`}
    >
      {/* Content */}
      <div className={cn(
        'flex-1 w-full',
        isOpen && 'overflow-hidden',
        !isOpen && 'overflow-visible'
      )}>
        {children}
      </div>
    </div>
  )
} 