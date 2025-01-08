import type { AIContext, AnalysisResult } from '@/lib/unified-ai/types'
import type { Database } from '@/lib/types/database.types'
import type { Result } from '@/lib/utils/result'

type DbArtwork = Database['public']['Tables']['artworks']['Row']

// Using const assertion instead of enum per .cursorrules
export const MM_AI_PROFILE_ID = '00000000-0000-4000-a000-000000000001' as const

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

// Validation types
export interface ValidationRules {
  title: {
    maxLength: 100
    required: true
    validate: (value: string) => Result<string, MMAIError>
  }
  images: {
    maxCount: 10
    maxSize: 10_000_000 // 10MB
    allowedTypes: readonly ['image/jpeg', 'image/png', 'image/webp']
    requireAltText: true
  }
  description: {
    maxLength: 1000
    required: false
  }
  tags: {
    maxCount: 10
    maxLength: 30
    validate: (value: string[]) => Result<string[], MMAIError>
  }
} 