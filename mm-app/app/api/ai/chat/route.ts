import { NextResponse } from 'next/server';
import { getGeminiResponse, getArtExpertResponse } from '@/lib/ai/gemini';

interface ChatRequest {
  prompt: string;
  config?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
  useArtExpertContext?: boolean;
}

export async function POST(req: Request) {
  try {
    const { prompt, config, useArtExpertContext } = await req.json() as ChatRequest;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = useArtExpertContext
      ? await getArtExpertResponse(prompt, config)
      : await getGeminiResponse(prompt, { config });
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 