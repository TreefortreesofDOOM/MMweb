import { createClient } from '@/lib/supabase/supabase-server';
import { getGeminiResponse, artworkTools } from '@/lib/ai/gemini';
import { NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { Content } from '@google/generative-ai';
import { buildSystemInstruction } from '@/lib/ai/instructions';
import { UserContext, ArtworkContext } from '@/lib/ai/types';
import { findRelevantChatHistory, formatChatContext } from '@/lib/ai/chat-history';
import { personaMapping } from '@/lib/unified-ai/types';

type AssistantRole = 'gallery' | 'artist' | 'patron';

interface SimilarityMatch {
  id: string;
  artwork_id: string;
  similarity: number;
}

interface ChatRequest {
  prompt: string;
  artworkId?: string;
  imageUrl?: string;
  role?: AssistantRole;
  chatHistory?: Content[];
  context?: string;
  systemInstruction?: string;
  userContext?: {
    id: string;
    role: AssistantRole;
    name?: string;
    bio?: string;
    artist_type?: string;
    website?: string;
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { 
      prompt, 
      artworkId, 
      imageUrl, 
      role = 'patron',
      chatHistory = [],
      context: customContext,
      systemInstruction: customInstruction,
      userContext
    } = await request.json() as ChatRequest;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Find relevant chat history
    const { similarConversations, artworkHistory } = await findRelevantChatHistory(
      userId,
      prompt,
      artworkId
    );

    // Format chat history into context
    const historyContext = formatChatContext(similarConversations, artworkHistory);

    // Get artwork details if artworkId is provided
    let artworkContext: ArtworkContext | undefined;
    if (artworkId) {
      const { data: artwork } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', artworkId)
        .single();

      if (artwork) {
        artworkContext = {
          artwork: {
            title: artwork.title,
            description: artwork.description,
            price: artwork.price
          }
        };
      }
    }

    // Build system instruction with context
    const { instruction, contextMessage } = buildSystemInstruction(personaMapping[role], {
      artwork: artworkContext?.artwork,
      user: userContext || {
        id: userId,
        role
      }
    });

    // Add context message and user message to chat history
    const updatedChatHistory = [
      ...(contextMessage ? [contextMessage] : []),
      ...chatHistory,
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    // Get response from Gemini
    const response = await getGeminiResponse(prompt, { 
      systemInstruction: customInstruction || instruction,
      imageUrl,
      temperature: 0.5,
      chatHistory: updatedChatHistory,
      context: customContext || JSON.stringify({ userId }),
      tools: artworkTools.tools
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 