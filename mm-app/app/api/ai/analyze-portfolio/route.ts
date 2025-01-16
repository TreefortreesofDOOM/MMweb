import { NextResponse } from 'next/server'
import { UnifiedAIClient, PortfolioAnalyzer, collectPortfolioData, PortfolioAnalysisType } from '@/lib/ai'
import { env } from '@/lib/env'
import { getAISettings } from '@/lib/actions/ai-settings-actions'
import { createActionClient } from '@/lib/supabase/supabase-action-utils'
import { UserRole } from '@/lib/navigation/types'
import { PERSONALITIES, getPersonalizedContext } from '@/lib/ai/personalities'

export async function POST(request: Request): Promise<Response> {
  try {
    const { profileId, analysisTypes } = await request.json()

    if (!profileId || !analysisTypes?.length) {
      return NextResponse.json(
        { status: 'error', error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate analysis types
    const validAnalysisTypes = (analysisTypes as string[]).filter((type: string): type is PortfolioAnalysisType => {
      return ['portfolio_composition', 'portfolio_presentation', 'portfolio_pricing', 'portfolio_market'].includes(type)
    })

    if (validAnalysisTypes.length === 0) {
      return NextResponse.json(
        { status: 'error', error: 'No valid analysis types provided' },
        { status: 400 }
      )
    }

    // Get user and profile using Supabase
    const supabase = await createActionClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      return NextResponse.json(
        { status: 'error', error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get profile to check artist role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { status: 'error', error: 'Failed to get profile' },
        { status: 500 }
      )
    }

    const persona = profile.role as UserRole

    // Get user settings for AI personality
    const { data: userSettings } = await supabase
      .rpc('get_user_settings', {
        p_user_id: session.user.id
      })

    // Get user's preferred AI personality
    const preferredCharacter = userSettings?.preferences?.aiPersonality?.toUpperCase() || 'JARVIS'
    const characterPersonality = PERSONALITIES[preferredCharacter as keyof typeof PERSONALITIES]
    const rolePersonality = PERSONALITIES[persona.toUpperCase() as keyof typeof PERSONALITIES]

    // Get personalized context
    const personaContext = rolePersonality 
      ? getPersonalizedContext(rolePersonality, 'portfolio')
      : getPersonalizedContext(characterPersonality, 'portfolio')

    // Get AI settings
    const { data: aiSettings, error: aiSettingsError } = await getAISettings()
    if (aiSettingsError || !aiSettings) {
      return NextResponse.json(
        { status: 'error', error: 'Failed to load AI settings' },
        { status: 500 }
      )
    }

    // Initialize AI client
    const client = new UnifiedAIClient({
      primary: {
        provider: aiSettings.primary_provider as 'chatgpt' | 'gemini',
        config: {
          apiKey: env.OPENAI_API_KEY,
          model: aiSettings.primary_provider === 'chatgpt' ? env.OPENAI_MODEL : env.GEMINI_TEXT_MODEL,
          temperature: 0.7,
          maxTokens: 2048
        }
      },
      fallback: aiSettings.fallback_provider ? {
        provider: aiSettings.fallback_provider as 'chatgpt' | 'gemini',
        config: {
          apiKey: env.GOOGLE_AI_API_KEY,
          model: aiSettings.fallback_provider === 'chatgpt' ? env.OPENAI_MODEL : env.GEMINI_TEXT_MODEL,
          temperature: 0.7,
          maxTokens: 2048
        }
      } : undefined,
    })

    // Collect portfolio data
    const portfolioData = await collectPortfolioData(profileId)
    
    // Initialize analyzer
    const analyzer = new PortfolioAnalyzer(client)

    // Run analyses
    const results = []
    for (const type of validAnalysisTypes) {
      try {
        const result = await analyzer.analyzePortfolio({
          type,
          data: portfolioData,
          context: {
            route: `/artist/analyze-portfolio/${type}`,
            pageType: 'portfolio',
            persona,
            characterPersonality: preferredCharacter,
            personaContext,
            data: {
              userId: profileId
            }
          }
        })
        results.push({ type, result })
      } catch (err) {
        console.error(`Error analyzing ${type}:`, err)
        results.push({
          type,
          result: {
            type,
            status: 'error' as const,
            error: err instanceof Error ? err.message : 'Analysis failed',
            summary: '',
            recommendations: []
          }
        })
      }
    }

    return NextResponse.json({
      status: 'success',
      results
    })
  } catch (err) {
    console.error('Error in portfolio analysis:', err)
    return NextResponse.json(
      { 
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to analyze portfolio'
      },
      { status: 500 }
    )
  }
} 