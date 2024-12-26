import { NextResponse } from 'next/server';
import { getGeminiResponse } from '@/lib/ai/gemini';
import { ARTWORK_ANALYSIS_PROMPTS } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const { imageUrl, imageBase64 } = await request.json();

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Either imageUrl or imageBase64 must be provided' },
        { status: 400 }
      );
    }

    // Run analyses in parallel
    const [description, style, techniques, keywords] = await Promise.all([
      getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.description, { 
        imageUrl, 
        imageBase64,
        temperature: 0.7 
      }),
      getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.style, { 
        imageUrl,
        imageBase64, 
        temperature: 0.5 
      }),
      getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.techniques, { 
        imageUrl,
        imageBase64,
        temperature: 0.5 
      }),
      getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.keywords, { 
        imageUrl,
        imageBase64,
        temperature: 0.5 
      })
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