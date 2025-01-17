'use server'

import { createActionClient } from '@/lib/supabase/supabase-action-utils'
import { ok, err, type Result } from '@/lib/utils/core/result-utils'
import { validateParams } from '@/lib/utils/content/mm-ai-validation-utils'
import { updateArtworkEmbeddings } from '@/lib/ai/embeddings'
import { ErrorService } from '@/lib/utils/error/error-service-utils'
import { MM_AI_PROFILE_ID } from '@/lib/constants/mm-ai-constants'
import type { MMAIError, PostArtworkParams } from '@/lib/types/mm-ai-types'

const errorService = ErrorService.getInstance()

export async function postMMAIArtwork(
  params: PostArtworkParams,
  metadata?: Record<string, unknown>
): Promise<Result<{ id: string }, MMAIError>> {
  // Early return for validation
  const validationResult = await validateParams(params)
  if (!validationResult.ok) {
    errorService.logError({
      code: 'MMAI_001',
      message: 'Validation failed',
      context: 'postMMAIArtwork:validation',
      type: 'validation',
      timestamp: new Date().toISOString(),
      metadata: { params }
    })
    return validationResult
  }

  try {
    const supabase = await createActionClient()

    // Insert the artwork
    const { data, error } = await supabase
      .from('artworks')
      .insert({
        title: params.title,
        description: params.description,
        images: params.images,
        keywords: params.tags,
        artist_id: MM_AI_PROFILE_ID,
        status: 'published',
        ai_generated: true,
        ai_context: params.aiContext,
        analysis_results: params.analysisResults,
        ai_metadata: metadata
      })
      .select()
      .single()

    if (error) {
      errorService.logError({
        code: 'MMAI_003',
        message: 'Failed to insert artwork',
        context: 'postMMAIArtwork:insert',
        type: 'database',
        timestamp: new Date().toISOString(),
        metadata: { 
          error: error.message,
          code: error.code,
          params 
        }
      })
      return err({ code: 'DATABASE_ERROR', message: 'Failed to create artwork' })
    }

    // Generate and store embeddings for the artwork
    try {
      await updateArtworkEmbeddings({
        artwork_id: data.id,
        title: params.title,
        description: params.description || '',
        tags: params.tags || [],
        alt_texts: params.images.map(img => img.alt),
        ai_context: params.aiContext,
        ai_metadata: metadata,
        status: 'published',
        artist_id: MM_AI_PROFILE_ID
      })
    } catch (embeddingError) {
      errorService.logError({
        code: 'MMAI_004',
        message: 'Failed to generate embeddings',
        context: 'postMMAIArtwork:embeddings',
        type: 'error',
        timestamp: new Date().toISOString(),
        metadata: { error: embeddingError, artworkId: data.id }
      })
      // Don't fail the artwork creation if embeddings fail
    }

    return ok({ id: data.id })
  } catch (error) {
    errorService.logError({
      code: 'MMAI_005',
      message: 'Unexpected error in MM AI post',
      context: 'postMMAIArtwork:unexpected',
      type: 'error',
      timestamp: new Date().toISOString(),
      metadata: { error, params }
    })
    return err({ code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' })
  }
} 