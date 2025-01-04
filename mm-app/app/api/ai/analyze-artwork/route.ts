import { NextResponse } from 'next/server'
import { UnifiedAIClient } from '@/lib/ai/unified-client'
import { env } from '@/lib/env'
import { ANALYSIS_PROMPTS, AI_TEMPERATURE } from '@/lib/ai/instructions'

export async function POST(request: Request) {
  try {
    console.log('=== Starting artwork analysis ===')
    const { imageUrl, types } = await request.json()
    const type = Array.isArray(types) ? types[0] : types // For backward compatibility
    console.log('Analysis request:', { types: Array.isArray(types) ? types : [type], hasImageUrl: !!imageUrl })
    
    if (!imageUrl) {
      console.log('Error: No image URL provided')
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    if (!types || (Array.isArray(types) && types.length === 0)) {
      console.log('Error: No analysis types provided')
      return NextResponse.json(
        { error: 'Analysis types are required' },
        { status: 400 }
      )
    }

    // Create client with API key configuration - only create once
    console.log('Initializing UnifiedAIClient')
    const client = new UnifiedAIClient({
      primary: {
        provider: 'gemini',
        config: {
          apiKey: env.GOOGLE_AI_API_KEY,
          temperature: AI_TEMPERATURE.balanced,
          maxOutputTokens: 1024
        }
      }
    })

    // Process each analysis type
    const analysisTypes = Array.isArray(types) ? types : [type]
    const results = await Promise.all(analysisTypes.map(async (type) => {
      // Get the appropriate prompt based on type
      let prompt: string
      let temperature = AI_TEMPERATURE.balanced
      switch (type) {
        case 'artwork_description':
          prompt = ANALYSIS_PROMPTS.description
          temperature = AI_TEMPERATURE.creative
          break
        case 'artwork_style':
          prompt = ANALYSIS_PROMPTS.style
          temperature = AI_TEMPERATURE.factual
          break
        case 'artwork_techniques':
          prompt = ANALYSIS_PROMPTS.techniques
          temperature = AI_TEMPERATURE.factual
          break
        case 'artwork_keywords':
          prompt = ANALYSIS_PROMPTS.keywords
          temperature = AI_TEMPERATURE.factual
          break
        default:
          console.log('Error: Invalid analysis type:', type)
          throw new Error('Invalid analysis type')
      }

      console.log('Analysis configuration:', {
        type,
        temperature,
        promptLength: prompt.length
      })

      // Get response from Gemini
      console.log('Sending request to Gemini for type:', type)
      const response = await client.sendMessage(prompt, { 
        imageUrl, 
        temperature,
        systemInstruction: `You are an expert art curator and critic. Analyze the provided artwork image according to the prompt. Only respond with the analysis, no other additional text.`
      })

      console.log('Received response from Gemini:', {
        type,
        hasContent: !!response.content,
        contentLength: response.content?.length
      })

      if (!response.content) {
        console.log('Error: Empty response from AI for type:', type)
        throw new Error('No response from AI')
      }

      // Process response based on type
      let result
      if (type === 'artwork_description') {
        result = {
          summary: response.content,
          details: []
        }
      } else {
        // For styles, techniques, and keywords, split into arrays
        const items = response.content.split(',').map((item: string) => item.trim()).filter(Boolean)
        result = {
          summary: items.join(', '),
          details: items
        }
      }

      console.log('Processed result:', {
        type,
        summaryLength: result.summary.length,
        detailsCount: result.details.length
      })

      return { type, result }
    }))

    return NextResponse.json({
      status: 'success',
      results
    })
  } catch (error) {
    console.error('Error in artwork analysis:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to analyze artwork'
      },
      { status: 500 }
    )
  }
} 