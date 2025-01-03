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

const SIMILARITY_THRESHOLD = 0.8;
const MAX_MATCHES = 3;

export const findRelevantChatHistory = async (
  userId: string,
  query: string,
  artworkId?: string
): Promise<{
  similarConversations: ChatHistoryMatch[];
  artworkHistory?: ArtworkChatHistory[];
}> => {
  const supabase = await createClient();
  const [queryEmbedding] = await generateEmbedding(query);

  // Find similar conversations using vector search
  const { data: similarConversations } = await supabase.rpc(
    'find_similar_conversations',
    {
      p_user_id: userId,
      p_query: query,
      p_embedding: queryEmbedding,
      p_match_count: MAX_MATCHES,
      p_match_threshold: SIMILARITY_THRESHOLD
    }
  );

  // If artwork ID provided, get artwork-specific history
  let artworkHistory;
  if (artworkId) {
    const { data: artworkChats } = await supabase.rpc(
      'find_artwork_conversations',
      {
        p_user_id: userId,
        p_artwork_id: artworkId,
        p_match_count: MAX_MATCHES
      }
    );
    artworkHistory = artworkChats;
  }

  return {
    similarConversations: similarConversations || [],
    artworkHistory: artworkHistory || []
  };
};

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