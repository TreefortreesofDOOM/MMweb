import { createClient } from '@/lib/supabase/supabase-server';
import { getGeminiResponse } from '@/lib/ai/gemini';
import { NextResponse } from 'next/server';
import { AI_ROLES } from '@/lib/ai/prompts';
import { generateEmbedding } from '@/lib/ai/embeddings';

interface SimilarityMatch {
  id: string;
  artwork_id: string;
  similarity: number;
}

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
      
      // Get the artwork details
      const { data: artworks, error: artworksError } = await supabase
        .from('artworks')
        .select('id, title, description, artist_name')
        .eq('id', artworkId);

      if (artworksError) throw artworksError;
      
      const artwork = artworks?.[0];
      if (!artwork) throw new Error('Artwork not found');
      if (!artwork.title || !artwork.description) throw new Error('Artwork missing title or description');

      // Generate embedding for the artwork
      const content = `${artwork.title} ${artwork.description}`;
      const [embedding] = await generateEmbedding(content);
      const formattedEmbedding = `[${embedding.join(',')}]`;

      const { data: similarArtworks } = await supabase.rpc('match_artworks_gemini', {
        query_embedding: formattedEmbedding,
        match_threshold: 0.1,
        match_count: 5
      });

      if (similarArtworks && similarArtworks.length > 0) {
        // Get details for similar artworks
        const similarArtworkIds = (similarArtworks as SimilarityMatch[]).map(a => a.artwork_id);
        const { data: similarArtworkDetails } = await supabase
          .from('artworks')
          .select('id, title, artist_name')
          .in('id', similarArtworkIds);

        if (similarArtworkDetails) {
          similarArtworksContext = `
            Similar artworks:
            ${similarArtworkDetails.map(art => `- ${art.title} by ${art.artist_name}`).join('\n')}
          `;
        }
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