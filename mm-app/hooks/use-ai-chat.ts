'use client';

import { useState, useCallback } from 'react';
import { Content } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseAIChatProps {
  assistantType: 'gallery' | 'artist' | 'patron';
  artworkId?: string;
  imageUrl?: string;
}

export function useAIChat({ assistantType, artworkId, imageUrl }: UseAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Content[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          assistantType,
          artworkId,
          imageUrl,
          chatHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Update chat history with the new messages
      setChatHistory(data.chatHistory);

      return data.response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [assistantType, artworkId, imageUrl, chatHistory]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { role, content }]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setChatHistory([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    addMessage,
    clearMessages,
  };
} 