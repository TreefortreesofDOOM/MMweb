import { NextResponse } from 'next/server';
import { getGeminiResponse } from '@/lib/ai/gemini';
import { ARTWORK_ANALYSIS_PROMPTS } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
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

    return NextResponse.json({
      description,
      styles: styleArray,
      techniques: techniquesArray,
      keywords: keywordsArray
    });

  } catch (error) {
    console.error('Error analyzing artwork:', error);
    return NextResponse.json(
      { error: 'Failed to analyze artwork' },
      { status: 500 }
    );
  }
} 