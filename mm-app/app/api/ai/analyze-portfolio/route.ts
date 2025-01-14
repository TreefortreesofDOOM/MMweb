import { NextResponse } from 'next/server'
import { UnifiedAIClient, PortfolioAnalyzer, collectPortfolioData, PortfolioAnalysisType } from '@/lib/ai'
import { env } from '@/lib/env'
import { getAISettings } from '@/lib/actions/ai-settings-actions'
import { createActionClient } from '@/lib/supabase/supabase-action-utils'
import { ARTIST_ROLES } from '@/lib/types/custom-types'
import { UserRole } from '@/lib/navigation/types'
import { PERSONALITIES, getPersonalizedContext } from '@/lib/ai/personalities'

export async function POST(request: Request) {
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
      .select('artist_type, role')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      return Response.json({ error: 'Failed to get profile' }, { status: 500 });
    }

    const persona = profile.role as UserRole;

    // Get user settings for AI personality
    const { data: userSettings } = await supabase
      .rpc('get_user_settings', {
        p_user_id: session.user.id
      });

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

    // Initialize AI client with correct config structure
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
      } : undefined
    })

    // Collect portfolio data
    console.log('Collecting portfolio data for:', profileId)
    const portfolioData = await collectPortfolioData(profileId)

    // Initialize portfolio analyzer with context
    const analyzer = new PortfolioAnalyzer(client)

    // Process each analysis type in parallel with unique contexts
    console.log('Starting portfolio analysis:', validAnalysisTypes)
    const analysisPromises = validAnalysisTypes.map(type => 
      analyzer.analyzePortfolio({
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
    )

    const results = await Promise.all(
      analysisPromises.map(async (promise, index) => {
        try {
          const result = await promise
          return { 
            type: validAnalysisTypes[index],
            result 
          }
        } catch (error) {
          console.error(`Error analyzing ${validAnalysisTypes[index]}:`, error)
          return {
            type: validAnalysisTypes[index],
            result: {
              type: validAnalysisTypes[index],
              status: 'error',
              error: error instanceof Error ? error.message : 'Analysis failed',
              summary: '',
              recommendations: []
            }
          }
        }
      })
    )

    return NextResponse.json({
      status: 'success',
      results
    })
  } catch (error) {
    console.error('Error in portfolio analysis:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to analyze portfolio'
      },
      { status: 500 }
    )
  }
} 