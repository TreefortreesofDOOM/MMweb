import { NextResponse } from 'next/server'
import { UnifiedAIClient } from '@/lib/ai/unified-client'
import type { PortfolioData } from '@/lib/ai/portfolio-data-collector'
import type { PortfolioAnalysisType } from '@/lib/ai/portfolio-types'
import { env } from '@/lib/env'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    console.log('=== Portfolio Analysis API: Starting ===')
    const body = await req.json()
    console.log('=== Received request body ===', JSON.stringify(body, null, 2))
    
    const { portfolioData, analysisType } = body

    if (!portfolioData || !analysisType) {
      console.error('=== Missing required data ===', { portfolioData: !!portfolioData, analysisType })
      return NextResponse.json({
        type: analysisType,
        content: 'Missing required data for portfolio analysis',
        status: 'error',
        results: {
          summary: 'Missing required data for portfolio analysis',
          details: []
        }
      }, { status: 400 })
    }

    console.log('=== Initializing AI client ===')
    const client = new UnifiedAIClient()

    console.log('=== Starting portfolio analysis ===', { analysisType })
    const result = await client.analyzePortfolio(portfolioData, analysisType, {
      temperature: 0.7,
      maxTokens: 1500
    })
    console.log('=== Raw analysis result ===', JSON.stringify(result, null, 2))

    if (!result || !result.summary) {
      console.error('=== Invalid analysis result ===', { result })
      return NextResponse.json({
        type: analysisType,
        content: 'Failed to generate portfolio analysis',
        status: 'error',
        results: {
          summary: 'Failed to generate portfolio analysis',
          details: []
        }
      }, { status: 500 })
    }

    const response = {
      type: analysisType,
      content: result.summary,
      status: 'success' as const,
      results: {
        summary: result.summary,
        details: Array.isArray(result.recommendations) ? result.recommendations : []
      }
    }
    console.log('=== Sending successful response ===', JSON.stringify(response, null, 2))
    return NextResponse.json(response)

  } catch (error) {
    console.error('=== Portfolio analysis error ===', error)
    return NextResponse.json({
      type: 'error',
      content: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 'error',
      results: {
        summary: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: []
      }
    }, { status: 500 })
  }
} 