'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useUnifiedAIContext, useUnifiedAIActions } from '@/lib/unified-ai/hooks'
import { useChat } from '@/lib/unified-ai/use-chat'
import { stagger } from '@/lib/unified-ai/animations'
import type { UnifiedAIChatViewProps } from '@/lib/unified-ai/types'

export const UnifiedAIChatView = ({
  className,
  onAnalysisRequest
}: UnifiedAIChatViewProps) => {
  const [input, setInput] = useState('')
  const { conversation } = useUnifiedAIContext()
  const { setMode } = useUnifiedAIActions()
  const { isLoading, sendMessage } = useChat()

  const handleAnalysisClick = () => {
    setMode('analysis')
    onAnalysisRequest?.()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    try {
      await sendMessage(input.trim())
      setInput('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className={cn('flex h-full flex-col space-y-4', className)}>
      {/* Messages */}
      <motion.div
        className="flex-1 space-y-4 overflow-auto"
        initial="initial"
        animate="animate"
        variants={stagger.container}
      >
        <AnimatePresence mode="popLayout">
          {conversation.map((message, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                'flex w-full',
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              )}
            >
              <motion.div
                layout
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2',
                  message.role === 'assistant'
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                {message.content}
              </motion.div>
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
              className="flex justify-start"
            >
              <div className="flex space-x-2 rounded-lg bg-muted px-4 py-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="h-2 w-2 rounded-full bg-current"
                />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="h-2 w-2 rounded-full bg-current"
                />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="h-2 w-2 rounded-full bg-current"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Input */}
      <motion.form
        layout
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[80px] resize-none"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleAnalysisClick}
            disabled={isLoading}
          >
            Switch to Analysis
          </Button>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </motion.form>
    </div>
  )
} 