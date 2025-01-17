import { NextResponse } from 'next/server'
import { UnifiedAIClient } from '@/lib/ai/unified-client'
import { env } from '@/lib/constants/env'

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
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

    // Send the query to the AI client with specific options
    const response = await client.sendMessage(query, {
      systemInstruction: `You are an analytics assistant. Based on the user's query, determine which analytics function to call
        and what parameters to use. The available functions are:
        - getMetricsOverview: Get overview of key metrics
        - getTopPages: Get most visited pages
        - getUserEngagement: Get user engagement metrics
        - getConversionMetrics: Get conversion metrics
        - getFeatureUsage: Get feature usage metrics
        - getGalleryVisits: Get gallery visit metrics
        - getSocialMetrics: Get social engagement metrics
        - getArtworkMetrics: Get artwork metrics
        - getArtistFeatureMetrics: Get artist feature metrics
        
        Respond with a JSON object containing:
        {
          "functionName": "name of the function to call",
          "args": {
            "startDate": "ISO date string for start",
            "endDate": "ISO date string for end",
            ... any other required parameters
          }
        }`
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to process analytics query' },
      { status: 500 }
    )
  }
} 