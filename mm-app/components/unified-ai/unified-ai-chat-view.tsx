'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/core/common-utils'
import { useUnifiedAIContext, useUnifiedAIActions } from '@/lib/unified-ai/hooks'
import { useChat } from '@/lib/unified-ai/use-chat'
import { stagger } from '@/lib/unified-ai/animations'
import type { UnifiedAIChatViewProps, UnifiedAIContextType } from '@/lib/unified-ai/types'
import { useAuth } from '@/hooks/use-auth'

export const UnifiedAIChatView = ({
  className,
  onAnalysisRequest
}: UnifiedAIChatViewProps) => {
  const [input, setInput] = useState('')
  const { conversation, pageContext, analysis } = useUnifiedAIContext()
  const activeCharacter = pageContext.characterPersonality?.name || 'JARVIS'
  const contextSuggestion = pageContext.personaContext || ''
  const activePersona = pageContext.persona
  const { setMode } = useUnifiedAIActions()
  const { isLoading, sendMessage } = useChat()
  const { profile } = useAuth()

  // Debug user role and persona mapping
  console.log('User:', profile)
  console.log('User role:', profile?.role)
  console.log('PageContext:', pageContext)
  console.log('CharacterPersonality:', pageContext.characterPersonality)
  console.log('Active persona:', activePersona)
  console.log('Active character:', activeCharacter)

  // Count completed analysis results
  const completedAnalysisCount = analysis.filter(result => result.status === 'success').length

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
    <div className={cn('flex h-full flex-col', className)}>
      {/* Personality Info */}
      <motion.div 
        className="flex-none flex flex-col space-y-2 rounded-lg bg-muted p-3"
        layout
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium">Character: {activeCharacter}</span>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-foreground">Role: {activePersona || 'loading...'}</span>
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          </div>
        </div>
        {contextSuggestion && (
          <div className="rounded border border-border/50 bg-background/50 p-2">
            <span className="text-[11px] text-muted-foreground">{contextSuggestion}</span>
          </div>
        )}
        {completedAnalysisCount > 0 && (
          <div className="flex items-center justify-between rounded border border-border/50 bg-background/50 p-2">
            <span className="text-[11px] text-muted-foreground">
              {completedAnalysisCount} analysis result{completedAnalysisCount !== 1 ? 's' : ''} available
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={handleAnalysisClick}
            >
              View Analysis
            </Button>
          </div>
        )}
      </motion.div>

      {/* Messages */}
      <motion.div
        className="flex-1 space-y-4 overflow-y-auto min-h-0"
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
                  'max-w-[80%] rounded-lg px-3 py-1.5 text-sm',
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
        className="flex-none space-y-4 pt-4"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[60px] text-sm resize-none"
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