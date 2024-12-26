import { NextResponse } from 'next/server';
import { analyzeArtwork } from '@/lib/actions/ai';

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Create FormData to match the function signature
    const formData = new FormData();
    formData.append('imageUrl', imageUrl);

    const result = await analyzeArtwork(formData);

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.analysis);

  } catch (error) {
    console.error('Error analyzing artwork:', error);
    return NextResponse.json(
      { error: 'Failed to analyze artwork' },
      { status: 500 }
    );
  }
} 