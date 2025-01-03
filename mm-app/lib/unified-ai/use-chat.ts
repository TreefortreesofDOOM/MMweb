'use client'

import { useState } from 'react'
import { useUnifiedAIActions } from './hooks'
import type { Message } from './types'
import type { Content } from '@google/generative-ai'
import { useAuth } from '@/hooks/use-auth'

interface UseChatOptions {
  onError?: (error: Error) => void
  context?: string
  systemInstruction?: string
  role?: string
  artworkId?: string
  imageUrl?: string
  userContext?: {
    id: string
    role: string
    name?: string
    bio?: string
    artist_type?: string
    website?: string
  }
}

export function useChat(options: UseChatOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<Content[]>([])
  const [hasInitialContext, setHasInitialContext] = useState(false)
  const { addMessage, setMode } = useUnifiedAIActions()
  const { profile } = useAuth()

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true)
      setMode('chat')

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      }
      addMessage(userMessage)

      // Only send user context on first message
      const isFirstMessage = !hasInitialContext
      const userContext = isFirstMessage ? {
        id: profile?.id,
        role: profile?.artist_type || 'user',
        name: profile?.name,
        bio: profile?.bio,
        artist_type: profile?.artist_type,
        website: profile?.website
      } : undefined

      // Call the chat API route
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content,
          chatHistory,
          context: options.context,
          systemInstruction: options.systemInstruction,
          role: options.role || profile?.artist_type,
          artworkId: options.artworkId,
          imageUrl: options.imageUrl,
          userContext
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get AI response')
      }

      const { response: aiResponse, chatHistory: newChatHistory } = await response.json()

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }
      addMessage(assistantMessage)

      // Update chat history and mark context as initialized
      setChatHistory(newChatHistory)
      if (isFirstMessage) {
        setHasInitialContext(true)
      }

      return assistantMessage
    } catch (error) {
      options.onError?.(error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    sendMessage,
    chatHistory
  }
} 