'use client'

import { useState, useCallback } from 'react'
import { useUnifiedAIActions } from './hooks'
import { createMessage } from './utils'
import type { Message } from './types'

interface UseChatProps {
  onMessageSent?: (message: Message) => void
  onResponse?: (response: Message) => void
  onError?: (error: string) => void
}

export function useChat({ onMessageSent, onResponse, onError }: UseChatProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const { addMessage } = useUnifiedAIActions()

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true)

      // Create and add user message
      const userMessage = createMessage(content, 'user')
      addMessage(userMessage)
      onMessageSent?.(userMessage)

      // TODO: Implement actual chat logic here
      // For now, simulate response with a delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create and add assistant response
      const response = createMessage('This is a simulated response.', 'assistant')
      addMessage(response)
      onResponse?.(response)

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      onError?.(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [addMessage, onMessageSent, onResponse, onError])

  return {
    isLoading,
    sendMessage
  }
} 