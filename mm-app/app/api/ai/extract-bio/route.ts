import { NextResponse } from 'next/server'
import { extractBioFromWebsite } from '@/lib/ai/website-bio-extractor'
import { UnifiedAIClient } from '@/lib/ai/unified-client'
import { env } from '@/lib/constants/env'
import { getAISettings } from '@/lib/actions/ai-settings-actions'
import { AISettings } from '@/lib/types/ai-settings-types'

export async function POST(request: Request) {
  try {
    const { website } = await request.json()
    
    if (!website) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      )
    }

    // Get current AI provider settings
    const { data: settings } = await getAISettings() as { data: AISettings | null }
    
    // Create client with configured providers
    const client = new UnifiedAIClient({
      primary: {
        provider: settings?.primary_provider || env.AI_PRIMARY_PROVIDER || 'chatgpt',
        config: settings?.primary_provider === 'gemini' ? {
          apiKey: env.GOOGLE_AI_API_KEY,
          temperature: 0.2,
          maxOutputTokens: 1024
        } : {
          apiKey: env.OPENAI_API_KEY,
          temperature: 0.2,
          maxTokens: 1024
        }
      },
      fallback: settings?.fallback_provider ? {
        provider: settings.fallback_provider,
        config: settings.fallback_provider === 'gemini' ? {
          apiKey: env.GOOGLE_AI_API_KEY,
          temperature: 0.2,
          maxOutputTokens: 1024
        } : {
          apiKey: env.OPENAI_API_KEY,
          temperature: 0.2,
          maxTokens: 1024
        }
      } : undefined
    })

    const result = await extractBioFromWebsite(website, client)

    // Return both the bio extraction result and the website URL
    return NextResponse.json({
      ...result,
      website
    })
  } catch (error) {
    console.error('Error in bio extraction:', error)
    return NextResponse.json(
      { 
        bio: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to extract bio',
        website: ''
      },
      { status: 500 }
    )
  }
} 