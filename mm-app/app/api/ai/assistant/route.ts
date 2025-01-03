import { NextResponse } from 'next/server';
import { getGeminiResponse, artworkTools } from '@/lib/ai/gemini';
import { createClient } from '@/lib/supabase/supabase-server';
import { Content } from '@google/generative-ai';
import { buildSystemInstruction } from '@/lib/ai/instructions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/lib/env';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { personaMapping } from '@/lib/unified-ai/types';

interface AssistantRequest {
  message: string;
  assistantType: 'gallery' | 'artist' | 'patron';
  imageUrl?: string;
  artworkId?: string;
  chatHistory?: Content[];
}

// Function implementations
const functions = {
  getArtistArtworks: async ({ artistId, status = "all" }: { artistId: string; status?: "published" | "draft" | "all" }, context?: string) => {
    const contextData = context ? JSON.parse(context) : {};
    const supabase = await createClient();
    let query = supabase
      .from('artworks')
      .select(`
        *,
        profiles (
          name,
          bio
        )
      `)
      .eq('artist_id', contextData.userId || artistId);
    
    if (status !== "all") {
      query = query.eq('status', status);
    }

    const { data: artworks, error } = await query;
    if (error) throw error;
    return { artworks };
  },

  getArtworkDetails: async ({ artworkId }: { artworkId: string }, context?: string) => {
    const supabase = await createClient();
    const { data: artwork, error } = await supabase
      .from('artworks')
      .select(`
        *,
        profiles (
          name,
          bio
        )
      `)
      .eq('id', artworkId)
      .single();
    
    if (error) throw error;
    return { artwork };
  }
};

export async function POST(req: Request) {
  try {
    console.log('Starting assistant request processing');
    const { message, assistantType, imageUrl, artworkId, chatHistory = [] } = await req.json() as AssistantRequest;

    if (!message || !assistantType) {
      console.log('Missing required fields:', { message, assistantType });
      return NextResponse.json(
        { error: 'Message and assistant type are required' },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error getting profile:', profileError);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    console.log('Request parameters:', {
      message,
      assistantType,
      hasImage: !!imageUrl,
      artworkId,
      chatHistoryLength: chatHistory.length,
      userId: user.id
    });

    // Get artwork details if artworkId is provided
    let artworkContext = undefined;
    if (artworkId) {
      console.log('Fetching artwork details for:', artworkId);
      const supabase = await createClient();
      
      // Get artwork details
      const { data: artwork, error: artworkError } = await supabase
        .from('artworks')
        .select('title, description, price')
        .eq('id', artworkId)
        .single();

      if (artworkError) {
        console.error('Error fetching artwork:', artworkError);
      } else if (artwork) {
        // Generate embedding for the artwork
        const content = `${artwork.title} ${artwork.description}`;
        const [embedding] = await generateEmbedding(content);
        const formattedEmbedding = `[${embedding.join(',')}]`;

        // Get similar artworks
        const { data: similarArtworks, error: similarError } = await supabase.rpc('match_artworks_gemini', {
          query_embedding: formattedEmbedding,
          match_threshold: 0.1,
          match_count: 5
        });

        if (similarError) {
          console.error('Error fetching similar artworks:', similarError);
        }

        artworkContext = {
          artwork: {
            title: artwork.title,
            description: artwork.description,
            price: artwork.price
          },
          similarArtworks: similarArtworks || []
        };
        console.log('Artwork context built:', artworkContext);
      }
    }

    // Build system instruction with context
    console.log('Building system instruction for:', assistantType);
    const { instruction, contextMessage } = buildSystemInstruction(personaMapping[assistantType === 'gallery' ? 'admin' : assistantType === 'artist' ? 'verified_artist' : 'patron'], {
      ...artworkContext,
      user: {
        id: user.id,
        role: assistantType,
        ...profile
      }
    });
    console.log('System instruction length:', instruction.length);

    // Add context message and user message to chat history
    const updatedChatHistory = [
      ...(contextMessage ? [contextMessage] : []),
      ...chatHistory,
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];
    console.log('Updated chat history length:', updatedChatHistory.length);

    console.log('Calling Gemini API with parameters:', {
      messageLength: message.length,
      hasSystemInstruction: !!instruction,
      hasImage: !!imageUrl,
      temperature: 0.5,
      chatHistoryLength: updatedChatHistory.length,
      availableFunctions: {
        count: artworkTools.tools[0].functionDeclarations.length,
        names: artworkTools.tools[0].functionDeclarations.map((f: { name: string }) => f.name),
        mode: artworkTools.tool_config.functionCallingConfig.mode
      }
    });

    const response = await getGeminiResponse(message, { 
      systemInstruction: instruction,
      imageUrl,
      temperature: 0.5,
      chatHistory: updatedChatHistory,
      tools: artworkTools.tools,
      context: JSON.stringify({ userId: user.id })
    });
    
    console.log('Received response from Gemini API, length:', response.length);

    // Generate embeddings for message and response
    const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const [messageEmbeddingResult, responseEmbeddingResult] = await Promise.all([
      embeddingModel.embedContent(message),
      embeddingModel.embedContent(response)
    ]);

    // Convert embedding objects to arrays
    const messageEmbedding = messageEmbeddingResult.embedding.values;
    const responseEmbedding = responseEmbeddingResult.embedding.values;

    // Save chat history to database with embeddings
    const { error: saveError } = await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        assistant_type: assistantType,
        message,
        response,
        artwork_id: artworkId,
        metadata: {
          hasImage: !!imageUrl,
          systemInstructionLength: instruction.length,
          responseLength: response.length
        },
        context: {
          user: {
            id: user.id,
            role: assistantType
          },
          artwork: artworkContext?.artwork
        },
        message_embedding: messageEmbedding,
        response_embedding: responseEmbedding
      });

    if (saveError) {
      console.error('Error saving chat history:', saveError);
    }

    // Add assistant response to chat history
    updatedChatHistory.push({
      role: 'model',
      parts: [{ text: response }]
    });

    return NextResponse.json({ 
      response,
      chatHistory: updatedChatHistory
    });
  } catch (error) {
    // Log detailed error information
    const err = error as Error;
    console.error('AI assistant error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause,
      safetyDetails: err.cause && typeof err.cause === 'object' ? {
        blockReason: (err.cause as any).blockReason,
        safetyRatings: (err.cause as any).safetyRatings
      } : undefined
    });

    // If it's a safety block, return a more specific error
    if (err.message === 'Response blocked by safety settings') {
      return NextResponse.json(
        { 
          error: 'Content was blocked by safety filters',
          details: err.cause
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
} 