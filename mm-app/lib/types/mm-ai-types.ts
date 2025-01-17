import type { AIContext, AnalysisResult } from '@/lib/unified-ai/types'
import type { Database } from '@/lib/types/database.types'
import type { Result } from '@/lib/utils/core/result-utils'

type DbArtwork = Database['public']['Tables']['artworks']['Row']

export { MM_AI_PROFILE_ID } from '@/lib/constants/mm-ai-constants'

export interface PostArtworkContent {
  title: string
  images: Array<{
    url: string
    alt: string
  }>
  description?: string
  tags?: string[]
}

export interface AgentMetadata {
  confidence: number
  model: string
  generation: {
    prompt: string
    parameters: Record<string, unknown>
  }
  accessibility: {
    altText: string
    description: string
  }
}

export interface PostArtworkParams extends PostArtworkContent {
  aiGenerated: true
  aiContext: AIContext
  analysisResults?: AnalysisResult[]
  metadata?: AgentMetadata
}

export type MMAIErrorCode = 
  | 'INVALID_INPUT'
  | 'DATABASE_ERROR'
  | 'ACCESSIBILITY_ERROR'
  | 'IMAGE_PROCESSING_ERROR'
  | 'UNEXPECTED_ERROR'
  | 'UNAUTHORIZED'

export interface MMAIError {
  code: MMAIErrorCode
  message: string
  details?: Record<string, unknown>
}

export type PostArtworkResult = Result<DbArtwork, MMAIError> 