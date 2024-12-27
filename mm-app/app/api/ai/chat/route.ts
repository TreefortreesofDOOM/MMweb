import { createClient } from '@/lib/supabase/server';
import { getGeminiResponse } from '@/lib/ai/gemini';
import { NextResponse } from 'next/server';
import { AI_ROLES } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const { prompt, artworkId, imageUrl, role, chatHistory } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get artwork details if artworkId is provided
    let artworkContext = '';
    if (artworkId) {
      const supabase = await createClient();
      const { data: artwork } = await supabase
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

      if (artwork) {
        artworkContext = `
          Title: ${artwork.title}
          Artist: ${artwork.profiles.name}
          Description: ${artwork.description}
          Price: $${artwork.price / 100}
          Artist Bio: ${artwork.profiles.bio || 'Not provided'}
        `;
      }
    }

    // Get similar artworks if available
    let similarArtworksContext = '';
    if (artworkId) {
      const supabase = await createClient();
      const { data: similarArtworks } = await supabase.rpc('match_artworks', {
        artwork_id: artworkId,
        match_threshold: 0.7,
        match_count: 5
      });

      if (similarArtworks && similarArtworks.length > 0) {
        similarArtworksContext = `
          Similar artworks:
          ${similarArtworks.map((art: any) => `- ${art.title} by ${art.artist_name}`).join('\n')}
        `;
      }
    }

    // Build system instruction based on role
    let systemInstruction = '';
    if (role === 'patron') {
      systemInstruction = `
         ${AI_ROLES.artExpert}

        Current artwork details:
        ${artworkContext}

        ${similarArtworksContext}

        Keep responses concise but informative and entertaining, focus on helping users make informed decisions.
      `;
    }

    const response = await getGeminiResponse(prompt, {
      context: systemInstruction,
      imageUrl,
      temperature: 0.7,
      chatHistory: chatHistory || []
    });

    return NextResponse.json({ 
      response,
      chatHistory: chatHistory || []
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
} 