'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeIn } from '@/lib/unified-ai/animations'
import type { UnifiedAITransitionProps } from '@/lib/unified-ai/types'

export const UnifiedAITransition = ({
  children,
  show,
  className
}: UnifiedAITransitionProps) => {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeIn}
          className={cn('w-full', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
} 