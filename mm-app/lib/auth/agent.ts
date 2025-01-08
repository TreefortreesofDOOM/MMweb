import { ok, err, type Result } from '@/lib/utils/result'
import type { MMAIError } from '@/lib/types/admin/mm-ai-types'
import { env } from '@/lib/env'
import type { NextRequest } from 'next/server'

const BEARER_PREFIX = 'Bearer '

export const validateAgentAuth = (request: NextRequest): Result<true, MMAIError> => {
  const authHeader = request.headers.get('authorization')

  // Early return if no auth header
  if (!authHeader) {
    return err({
      code: 'UNAUTHORIZED',
      message: 'Missing authorization header'
    })
  }

  // Early return if not bearer token
  if (!authHeader.startsWith(BEARER_PREFIX)) {
    return err({
      code: 'UNAUTHORIZED',
      message: 'Invalid authorization format'
    })
  }

  const token = authHeader.slice(BEARER_PREFIX.length)

  // Early return if token doesn't match
  if (token !== env.MM_AI_AGENT_KEY) {
    return err({
      code: 'UNAUTHORIZED',
      message: 'Invalid authorization token'
    })
  }

  return ok(true)
} 