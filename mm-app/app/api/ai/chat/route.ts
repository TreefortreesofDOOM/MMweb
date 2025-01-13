import { createClient } from '@/lib/supabase/supabase-server';
import { NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { Content } from '@google/generative-ai';
import { buildSystemInstruction } from '@/lib/ai/instructions';
import { UserContext, ArtworkContext } from '@/lib/ai/types';
import { findRelevantChatHistory, formatChatContext } from '@/lib/ai/chat-history';
import { personaMapping, type AssistantPersona } from '@/lib/unified-ai/types';
import { UnifiedAIClient } from '@/lib/ai/unified-client';
import { AIFunction } from '@/lib/ai/providers/base';
import { artworkTools } from '@/lib/ai/gemini';  // TODO: Move these to a provider-agnostic location
import { env } from '@/lib/env';
import type { UserRole } from '@/lib/navigation/types';

type AssistantRole = UserContext['role'];

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
  userContext?: Omit<UserContext, 'role'> & {
    role: AssistantRole;
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

    // Get user's role from profile
    const { data: profile, error: profileError } = await supabase
      .from('profile_roles')
      .select('mapped_role')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user role:', profileError);
      return NextResponse.json(
        { error: 'Error fetching user role' },
        { status: 500 }
      );
    }

    const { 
      prompt, 
      artworkId, 
      imageUrl, 
      role = profile?.mapped_role || 'patron',  // Use profile role as default
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
    const { instruction, contextMessage } = buildSystemInstruction(
      personaMapping[role === 'gallery' ? 'admin' : 
                    role === 'artist' ? 'artist' : 
                    role === 'patron' ? 'patron' : 'user'], 
      {
        artwork: artworkContext?.artwork,
        user: userContext ? {
          ...userContext,
          role: userContext.role === 'gallery' ? 'gallery' : 
                userContext.role === 'artist' ? 'artist' : 'patron'
        } : {
          id: userId,
          role: role === 'gallery' ? 'gallery' : 
                role === 'artist' ? 'artist' : 'patron'
        }
      }
    );

    // Initialize AI client
    const ai = new UnifiedAIClient({
      primary: {
        provider: 'chatgpt',
        config: {
          apiKey: env.OPENAI_API_KEY,
          model: env.OPENAI_MODEL,
          temperature: 0.5,
          maxTokens: 2048,
          threadExpiry: env.OPENAI_THREAD_EXPIRY,
          assistantId: env.OPENAI_ASSISTANT_ID
        }
      },
      fallback: {
        provider: 'gemini',
        config: {
          apiKey: env.GOOGLE_AI_API_KEY,
          temperature: 0.5,
          maxOutputTokens: 2048,
          model: 'gemini-1.5-flash-latest'
        }
      }
    });

    // Create chat history search function
    const searchChatHistory: AIFunction = {
      name: 'searchChatHistory',
      description: 'Search for relevant past conversations based on the current context',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The text to search for similar conversations'
          },
          match_count: {
            type: 'number',
            description: 'Number of similar conversations to return',
            default: 5
          },
          match_threshold: {
            type: 'number',
            description: 'Minimum similarity threshold (0-1)',
            default: 0.8
          }
        },
        required: ['query']
      },
      execute: async ({ query, match_count = 5, match_threshold = 0.8 }) => {
        const { similarConversations, artworkHistory } = await findRelevantChatHistory(
          userId,
          query,
          artworkId
        );
        return formatChatContext(similarConversations, artworkHistory);
      }
    };

    // Convert function declarations to AIFunctions with implementations
    const functions: AIFunction[] = [
      searchChatHistory,
      ...artworkTools.tools[0].functionDeclarations.map(fn => ({
        name: fn.name,
        description: fn.description,
        parameters: {
          type: 'object',
          properties: {...fn.parameters.properties},
          required: fn.parameters.required ? [...fn.parameters.required] : []
        },
        execute: artworkTools.tools[0].implementation[fn.name]
      }))
    ];

    // Register functions
    ai.registerFunctions(functions);

    // Convert chat history to unified format
    const unifiedChatHistory = [
      ...(contextMessage ? [{
        role: 'system' as const,
        content: contextMessage.parts[0].text || ''
      }] : []),
      ...chatHistory.map(msg => ({
        role: msg.role === 'model' ? 'assistant' as const : msg.role as 'user' | 'system',
        content: msg.parts[0].text || ''
      }))
    ];

    // Get response using unified client
    const response = await ai.sendMessage(prompt, {
      temperature: 0.5,
      functions,
      systemInstruction: customInstruction || instruction,
      context: customContext || JSON.stringify({ 
        userId,
        role,
        ...userContext 
      }),
      imageUrl,
      chatHistory: unifiedChatHistory
    });

    // Generate embeddings for message and response
    const [messageEmbedding] = await generateEmbedding(prompt);
    const [responseEmbedding] = await generateEmbedding(response.content);

    // Store chat history with embeddings
    const { error: insertError } = await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        assistant_type: role,
        message: prompt,
        response: response.content,
        artwork_id: artworkId,
        metadata: {
          imageUrl,
          ...response.metadata
        },
        context: {
          systemInstruction: customInstruction || instruction,
          userContext,
          customContext
        },
        message_embedding: messageEmbedding,
        response_embedding: responseEmbedding
      });

    if (insertError) {
      console.error('Error storing chat history:', insertError);
    }

    return NextResponse.json({ response: response.content });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 