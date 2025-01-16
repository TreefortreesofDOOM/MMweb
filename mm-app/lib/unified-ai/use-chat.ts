'use client'

import { useState } from 'react'
import { useUnifiedAIActions, useUnifiedAIContext } from './hooks'
import { useUnifiedAI } from './context'
import type { Message, AnalysisResult } from './types'
import type { Content } from '@google/generative-ai'
import { useAuth } from '@/hooks/use-auth'

interface UseChatOptions {
  onError?: (error: Error) => void
  context?: {
    data?: {
      artworkId?: string
    }
  }
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
  const { state } = useUnifiedAI()
  const { analysis } = state.context

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
      const userContext = profile ? {
        id: profile.id,
        role: profile.role,
        name: profile.full_name,
        bio: profile?.bio,
        artist_type: profile.role === 'verified_artist' ? 'verified' : profile.role === 'emerging_artist' ? 'emerging' : undefined,
        website: profile?.website
      } : undefined

      // Get completed analysis results
      const completedAnalysis = analysis.filter(result => 
        result.status === 'success'
      ).map(result => ({
        type: result.type,
        content: result.content,
        details: result.results?.details || []
      }))

      // Call the chat API route
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content,
          chatHistory,
          context: {
            ...options.context,
            analysis: completedAnalysis
          },
          systemInstruction: options.systemInstruction,
          role: options.role || profile?.role,
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
      console.error('Chat error:', error)
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