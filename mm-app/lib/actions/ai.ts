'use server';

import { createActionClient } from '@/lib/supabase/action';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { updateArtworkEmbeddings, findSimilarArtworks } from '@/lib/ai/embeddings';
import { blobToBase64 } from './helpers';
import { getGeminiResponse } from '@/lib/ai/gemini';
import { ARTWORK_ANALYSIS_PROMPTS } from '@/lib/ai/prompts';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

async function getModel(imageUrl?: string | null) {
  const modelName = imageUrl 
    ? process.env.GEMINI_VISION_MODEL || 'gemini-1.5-pro-vision'
    : process.env.GEMINI_TEXT_MODEL || 'gemini-1.5-pro';
  return genAI.getGenerativeModel({ model: modelName });
}

export async function analyzeArtwork(formData: FormData) {
  try {
    const imageUrl = formData.get('imageUrl') as string;
    if (!imageUrl) {
      return { error: 'No image URL provided' };
    }

    // Run analyses in parallel
    const [description, style, techniques, keywords] = await Promise.all([
      getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.description, { imageUrl, temperature: 0.7 }),
      getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.style, { imageUrl, temperature: 0.5 }),
      getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.techniques, { imageUrl, temperature: 0.5 }),
      getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.keywords, { imageUrl, temperature: 0.5 })
    ]);

    // Process comma-separated lists into arrays
    const styleArray = style.split(',').map(s => s.trim()).filter(Boolean);
    const techniquesArray = techniques.split(',').map(t => t.trim()).filter(Boolean);
    const keywordsArray = keywords.split(',').map(k => k.trim()).filter(Boolean);

    return { 
      analysis: {
        description,
        styles: styleArray,
        techniques: techniquesArray,
        keywords: keywordsArray
      }
    };
  } catch (error: any) {
    console.error('Error analyzing artwork:', error);
    return { error: error.message || 'Failed to analyze artwork' };
  }
}

export async function generateDescription(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const styles = formData.get('styles') as string;
    const techniques = formData.get('techniques') as string;
    const keywords = formData.get('keywords') as string;

    if (!title) {
      return { error: 'Title is required' };
    }

    // Parse JSON strings
    const stylesArray = styles ? JSON.parse(styles) : [];
    const techniquesArray = techniques ? JSON.parse(techniques) : [];
    const keywordsArray = keywords ? JSON.parse(keywords) : [];

    // Initialize the model
    const model = await getModel();

    // Prepare the prompt
    const prompt = `
      Generate a compelling artwork description for an artwork with:
      Title: ${title}
      ${stylesArray.length > 0 ? `Styles: ${stylesArray.join(', ')}` : ''}
      ${techniquesArray.length > 0 ? `Techniques: ${techniquesArray.join(', ')}` : ''}
      ${keywordsArray.length > 0 ? `Keywords: ${keywordsArray.join(', ')}` : ''}

      The description should be:
      1. 2-3 sentences long
      2. Engaging and professional
      3. Highlight the unique aspects of the artwork
      4. Mention the techniques and styles used
      5. Avoid clichés and generic language
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const description = aiResponse.text();

    return { description };
  } catch (error: any) {
    console.error('Error generating description:', error);
    return { error: error.message || 'Failed to generate description' };
  }
}

export async function updateEmbeddings(artworkId: string, title: string, description: string) {
  try {
    const supabase = await createActionClient();

    // Verify the artwork exists
    const { data: artwork, error: fetchError } = await supabase
      .from('artworks')
      .select('artist_id')
      .eq('id', artworkId)
      .single();

    if (fetchError) throw fetchError;
    if (!artwork) throw new Error('Artwork not found');

    // Update embeddings
    await updateArtworkEmbeddings(artworkId, title, description);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating embeddings:', error);
    return { error: error.message };
  }
}

export async function getSimilar(artworkId: string) {
  try {
    const supabase = await createActionClient();

    // Get the artwork details
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select('title, description')
      .eq('id', artworkId)
      .single();

    if (artworkError) throw artworkError;
    if (!artwork) throw new Error('Artwork not found');

    // Find similar artworks
    const queryText = `${artwork.title} ${artwork.description || ''}`;
    const similarArtworks = await findSimilarArtworks(queryText, {
      match_threshold: 0.7,
      match_count: 6
    });

    if (!similarArtworks) return { artworks: [] };

    // Get full artwork details
    const { data: artworksData, error: artworksError } = await supabase
      .from('artworks')
      .select('*')
      .in('id', similarArtworks.map(a => a.artwork_id))
      .neq('id', artworkId)
      .eq('status', 'published');

    if (artworksError) throw artworksError;

    // Sort by similarity score
    const sortedArtworks = artworksData
      .map(artwork => ({
        ...artwork,
        similarity: similarArtworks.find(a => a.artwork_id === artwork.id)?.similarity || 0
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return { artworks: sortedArtworks };
  } catch (error: any) {
    console.error('Error finding similar artworks:', error);
    return { error: error.message };
  }
} 