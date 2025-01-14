import { UnifiedAIClient } from './unified-client'
import type { PortfolioData } from './portfolio-data-collector'
import type { PortfolioAnalysisType, PortfolioAnalysisResult } from './portfolio-types'
import { PORTFOLIO_ANALYSIS_PROMPTS } from './instructions'
import { buildSystemInstruction } from './instructions'
import type { UserRole } from '@/lib/navigation/types'

// Map database roles to system instruction roles
const roleMapping = {
  'admin': 'advisor',
  'verified_artist': 'mentor',
  'emerging_artist': 'mentor',
  'patron': 'collector',
  'user': 'curator'
} as const;

// Map analysis types to prompt types
const promptMapping = {
  'portfolio_composition': 'composition',
  'portfolio_presentation': 'presentation',
  'portfolio_pricing': 'pricing',
  'portfolio_market': 'market'
} as const;

export interface PortfolioAnalysisOptions {
  type: PortfolioAnalysisType;
  data: PortfolioData;
  context?: {
    route: string;
    pageType: 'portfolio';
    persona: UserRole;
    personaContext?: string;
    characterPersonality?: string;
    data: {
      userId: string;
    };
  };
}

export class PortfolioAnalyzer {
  constructor(private client: UnifiedAIClient) {}

  private cleanJsonResponse(content: string): string {
    // Remove markdown code block markers
    return content.replace(/```json\n?|\n?```/g, '').trim();
  }

  async analyzePortfolio(options: PortfolioAnalysisOptions): Promise<PortfolioAnalysisResult> {
    const { type, data, context } = options;
    
    // Get prompt generator for analysis type
    const promptType = promptMapping[type];
    const prompt = PORTFOLIO_ANALYSIS_PROMPTS[promptType];
    if (!prompt) {
      throw new Error(`No prompt generator found for analysis type: ${type}`);
    }

    // Map the user's role to the correct system instruction role
    const userRole = context?.persona || 'user';
    const systemRole = roleMapping[userRole as keyof typeof roleMapping] || 'curator';

    // Build system instruction with mapped role and full context
    const systemInstruction = buildSystemInstruction(systemRole, {
      user: {
        id: context?.data?.userId || '',
        role: 'artist',
      },
      characterPersonality: context?.characterPersonality,
      personaContext: context?.personaContext
    });

    console.log('System Instruction:', {
      role: systemRole,
      instruction: systemInstruction.instruction,
      hasSystemInstruction: !!systemInstruction.instruction,
      characterPersonality: context?.characterPersonality,
      personaContext: context?.personaContext
    });

    try {
      const response = await this.client.sendMessage(prompt(data), {
        context: context ? JSON.stringify(context) : undefined,
        systemInstruction: systemInstruction.instruction
      });

      try {
        const result = JSON.parse(this.cleanJsonResponse(response.content));

        if (!result.summary || !Array.isArray(result.recommendations)) {
          throw new Error('Invalid response format');
        }

        return {
          type,
          status: 'success',
          summary: result.summary,
          recommendations: result.recommendations
        };
      } catch (error) {
        console.error('Error parsing AI response:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in portfolio analysis:', error);
      throw error;
    }
  }
} 