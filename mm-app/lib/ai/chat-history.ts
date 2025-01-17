import { env } from '@/lib/constants/env';
import { createClient } from '@/lib/supabase/supabase-server';
import { generateEmbedding } from './embeddings';

interface ChatHistoryMatch {
  message: string;
  response: string;
  similarity: number;
}

interface ArtworkChatHistory {
  message: string;
  response: string;
  created_at: string;
  metadata: Record<string, any>;
  context: Record<string, any>;
}

export async function findRelevantChatHistory(
  userId: string,
  prompt: string,
  artworkId?: string
): Promise<{
  similarConversations: ChatHistoryMatch[];
  artworkHistory: ArtworkChatHistory[];
}> {
  try {
    const supabase = await createClient();
    const [promptEmbedding] = await generateEmbedding(prompt, { provider: env.AI_PRIMARY_PROVIDER as 'openai' | 'gemini' });

    // Find similar conversations
    const { data: similarConversations, error: similarError } = await supabase.rpc(
      'find_similar_conversations',
      {
        p_user_id: userId,
        p_query: prompt,
        p_embedding: promptEmbedding,
        p_match_count: 5,
        p_match_threshold: 0.8
      }
    );

    if (similarError) throw similarError;

    // Find artwork-specific conversations if artworkId is provided
    let artworkHistory: ArtworkChatHistory[] = [];
    if (artworkId) {
      const { data: artworkConversations, error: artworkError } = await supabase.rpc(
        'find_artwork_conversations',
        {
          p_user_id: userId,
          p_artwork_id: artworkId,
          p_match_count: 5
        }
      );

      if (artworkError) throw artworkError;
      artworkHistory = artworkConversations || [];
    }

    return {
      similarConversations: similarConversations || [],
      artworkHistory
    };
  } catch (error) {
    console.error('Error finding relevant chat history:', error);
    return {
      similarConversations: [],
      artworkHistory: []
    };
  }
}

export const formatChatContext = (
  similarConversations: ChatHistoryMatch[],
  artworkHistory?: ArtworkChatHistory[]
): string => {
  let context = '';

  // Add relevant past conversations
  if (similarConversations.length > 0) {
    context += '\nRelevant past conversations:\n';
    similarConversations.forEach(conv => {
      context += `Q: ${conv.message}\nA: ${conv.response}\n`;
    });
  }

  // Add artwork-specific history
  if (artworkHistory?.length) {
    context += '\nPrevious conversations about this artwork:\n';
    artworkHistory.forEach(conv => {
      context += `Q: ${conv.message}\nA: ${conv.response}\n`;
    });
  }

  return context;
}; 