'use client'

import { cn } from '@/lib/utils'
import { useUnifiedAIMode } from '@/lib/unified-ai/hooks'
import type { UnifiedAIContainerProps } from '@/lib/unified-ai/types'

export const UnifiedAIContainer = ({
  children,
  mode: forcedMode,
  className
}: UnifiedAIContainerProps) => {
  const currentMode = useUnifiedAIMode()
  const mode = forcedMode || currentMode

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex flex-col',
        'w-full max-w-[400px] rounded-lg bg-background shadow-lg',
        'transition-all duration-200 ease-in-out',
        className
      )}
      role="complementary"
      aria-label={`AI Assistant - ${mode} mode`}
    >
      {children}
    </div>
  )
} 