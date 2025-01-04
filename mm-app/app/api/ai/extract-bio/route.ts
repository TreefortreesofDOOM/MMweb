import { NextResponse } from 'next/server'
import { extractBioFromWebsite } from '@/lib/ai/website-bio-extractor'
import { UnifiedAIClient } from '@/lib/ai/unified-client'
import { env } from '@/lib/env'

export async function POST(request: Request) {
  try {
    const { website } = await request.json()
    
    if (!website) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      )
    }

    // Create client with API key configuration
    const client = new UnifiedAIClient({
      primary: {
        provider: 'gemini',
        config: {
          apiKey: env.GOOGLE_AI_API_KEY,
          temperature: 0.2,
          maxOutputTokens: 1024
        }
      }
    })

    const result = await extractBioFromWebsite(website, client)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in bio extraction:', error)
    return NextResponse.json(
      { 
        bio: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to extract bio'
      },
      { status: 500 }
    )
  }
} 