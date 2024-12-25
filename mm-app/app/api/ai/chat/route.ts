import { createClient } from '@/lib/supabase/server';
import { getGeminiResponse } from '@/lib/ai/gemini';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, artworkId, imageUrl, role } = await request.json();

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
        match_threshold: 0.8,
        match_count: 5
      });

      if (similarArtworks && similarArtworks.length > 0) {
        similarArtworksContext = `
          Similar artworks:
          ${similarArtworks.map((art: any) => `- ${art.title} by ${art.artist_name}`).join('\n')}
        `;
      }
    }

    // Build context based on role
    let context = '';
    if (role === 'patron') {
      context = `
        You are an AI Art Advisor, an expert in art history, contemporary art, and art collection.
        Your role is to help art enthusiasts and collectors understand artworks, make informed decisions,
        and build meaningful collections.

        Current artwork details:
        ${artworkContext}

        ${similarArtworksContext}

        Please provide thoughtful, educational responses that help users appreciate the artwork's:
        - Artistic style and technique
        - Historical and cultural context
        - Market value and investment potential
        - Relationship to similar works
        - Place in contemporary art trends

        Keep responses concise but informative, focusing on helping users make informed decisions.
      `;
    }

    const response = await getGeminiResponse(prompt, {
      context,
      imageUrl,
      temperature: 0.7,
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
} 