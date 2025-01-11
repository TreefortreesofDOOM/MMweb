'use server'

import { createActionClient } from '@/lib/supabase/supabase-action-utils'
import { logError } from '@/lib/utils/error-utils'
import { ok, err, type Result } from '@/lib/utils/result'
import { validateParams } from '@/lib/utils/mm-ai-validation'
import { updateArtworkEmbeddings } from '@/lib/ai/embeddings'
import type { MMAIError, PostArtworkParams } from '@/lib/types/admin/mm-ai-types'

export async function postMMAIArtwork(
  params: PostArtworkParams,
  metadata?: Record<string, unknown>
): Promise<Result<{ id: string }, MMAIError>> {
  // Early return for validation
  const validationResult = await validateParams(params)
  if (!validationResult.ok) {
    logError({
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
        artist_id: '00000000-0000-4000-a000-000000000001', // MM AI ID
        status: 'published',
        ai_generated: true,
        ai_context: params.aiContext,
        analysis_results: params.analysisResults,
        ai_metadata: metadata
      })
      .select()
      .single()

    if (error) {
      logError({
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
      const fullText = [
        params.title,
        params.description || '',
        ...(params.tags || [])
      ].join(' ')
      
      await updateArtworkEmbeddings(data.id, params.title, fullText)
    } catch (embeddingError) {
      logError({
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
    logError({
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