'use client'

import { useContextAwareness } from '@/lib/unified-ai/hooks/use-context-awareness'
import { useUnifiedAI } from '@/lib/unified-ai/context'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useCallback } from 'react'

export function UnifiedAIButton() {
  const { state, dispatch } = useUnifiedAI()
  const { suggestedAssistant } = useContextAwareness()

  const handleClick = useCallback(() => {
    // Set the suggested mode based on context
    dispatch({ type: 'SET_MODE', payload: suggestedAssistant.mode })
    
    // Open the panel
    dispatch({ type: 'SET_OPEN', payload: true })
  }, [dispatch, suggestedAssistant])

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        "fixed bottom-4 right-4 p-4 rounded-full shadow-lg",
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90 focus:ring-2 focus:ring-primary",
        "transition-colors duration-200"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      aria-label={`Open AI Assistant (${suggestedAssistant.type})`}
      tabIndex={0}
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">
          {suggestedAssistant.type === 'bio-extraction' ? 'Extract Bio' :
           suggestedAssistant.type === 'artwork-analysis' ? 'Analyze Artwork' :
           'AI Assistant'}
        </span>
      </div>
    </motion.button>
  )
} 