'use client';

import { useAIChat } from '@/hooks/use-ai-chat';
import { ChatInterface } from './chat-interface';

interface GalleryAssistantProps {
  artworkId?: string;
  imageUrl?: string;
}

export function GalleryAssistant({ artworkId, imageUrl }: GalleryAssistantProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    addMessage,
  } = useAIChat({
    assistantType: 'gallery',
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
      console.error('Error in gallery assistant:', error);
      throw error;
    }
  }

  return (
    <ChatInterface
      title="Gallery Assistant"
      description="Ask me about artworks, artists, styles, or any questions about the gallery."
      assistantType="gallery"
      onSendMessage={handleSendMessage}
      initialMessage="Hello! I'm your AI Gallery Assistant. I can help you explore artworks, learn about different styles and artists, and answer any questions you have about the gallery. What would you like to know?"
    />
  );
} 