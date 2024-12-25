import { NextResponse } from 'next/server';
import { getGeminiResponse } from '@/lib/ai/gemini';
import { createClient } from '@/lib/supabase/server';

interface AssistantRequest {
  message: string;
  assistantType: 'gallery' | 'artist' | 'patron';
  imageUrl?: string;
  artworkId?: string;
}

const ASSISTANT_CONTEXTS = {
  gallery: `You are an AI Gallery Assistant, helping visitors explore and understand artworks in our digital gallery.
Your role is to:
- Help users discover artworks based on their interests
- Explain art styles, techniques, and movements
- Share insights about artists and their work
- Provide historical and cultural context
- Answer questions about the gallery and its features

Please maintain a friendly, approachable tone while being informative and engaging.`,

  artist: `You are an AI Artist Assistant, helping artists manage and grow their presence in our digital gallery.
Your role is to:
- Help with portfolio management and curation
- Provide feedback on artwork presentations
- Assist with writing artist statements and descriptions
- Share market insights and pricing strategies
- Suggest ways to improve visibility and sales
- Guide professional development

Please maintain a supportive, professional tone while providing practical, actionable advice.`,

  patron: `You are an AI Patron Assistant, helping art collectors and buyers make informed decisions.
Your role is to:
- Help discover artworks matching preferences and interests
- Explain art valuation and investment potential
- Provide context about artists and their work
- Share insights about art movements and styles
- Guide collection building and management
- Answer questions about purchasing and ownership

Please maintain a professional, knowledgeable tone while being approachable and helpful.`
};

export async function POST(req: Request) {
  try {
    const { message, assistantType, imageUrl, artworkId } = await req.json() as AssistantRequest;

    if (!message || !assistantType) {
      return NextResponse.json(
        { error: 'Message and assistant type are required' },
        { status: 400 }
      );
    }

    // Get the appropriate context
    const context = ASSISTANT_CONTEXTS[assistantType];

    // If there's an artwork ID, get its details
    let artworkDetails = '';
    if (artworkId) {
      const supabase = await createClient();
      const { data: artwork } = await supabase
        .from('artworks')
        .select('title, description, price')
        .eq('id', artworkId)
        .single();

      if (artwork) {
        artworkDetails = `
Current artwork context:
Title: ${artwork.title}
Description: ${artwork.description || 'No description provided'}
Price: $${artwork.price}
`;
      }
    }

    // Combine context and artwork details
    const fullContext = `${context}\n\n${artworkDetails}`.trim();

    const response = await getGeminiResponse(message, { 
      context: fullContext,
      imageUrl 
    });
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI assistant error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 