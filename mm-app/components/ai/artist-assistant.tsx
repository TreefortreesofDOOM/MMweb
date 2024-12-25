'use client';

import { useAIChat } from '@/hooks/use-ai-chat';
import { ChatInterface } from './chat-interface';

interface ArtistAssistantProps {
  artworkId?: string;
  imageUrl?: string;
}

export function ArtistAssistant({ artworkId, imageUrl }: ArtistAssistantProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    addMessage,
  } = useAIChat({
    assistantType: 'artist',
    artworkId,
    imageUrl,
  });

  async function handleSendMessage(message: string) {
    try {
      addMessage('user', message);
      const response = await sendMessage(message);
      addMessage('assistant', response);
      return response;
    } catch (error) {
      console.error('Error in artist assistant:', error);
      throw error;
    }
  }

  return (
    <ChatInterface
      title="Artist Assistant"
      description="I can help with portfolio management, artwork descriptions, pricing, and professional development."
      assistantType="artist"
      onSendMessage={handleSendMessage}
      initialMessage="Welcome! I'm your AI Artist Assistant. I'm here to help you manage your portfolio, write compelling descriptions, optimize pricing, and grow your presence in the gallery. How can I assist you today?"
    />
  );
} 