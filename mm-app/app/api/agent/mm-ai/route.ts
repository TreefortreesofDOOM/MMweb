import { NextResponse, type NextRequest } from 'next/server'
import { validateAgentAuth } from '@/lib/auth/agent'
import { validateAdminAuth } from '@/lib/auth/admin'
import { postMMAIArtwork } from '@/lib/actions/admin/mm-ai-actions'
import type { PostArtworkParams } from '@/lib/types/admin/mm-ai-types'

export async function POST(request: NextRequest) {
  // Try agent auth first
  const agentAuthResult = validateAgentAuth(request)
  if (!agentAuthResult.ok) {
    // If agent auth fails, try admin auth
    const adminAuthResult = await validateAdminAuth(request)
    if (!adminAuthResult.ok) {
      return NextResponse.json(
        { error: adminAuthResult.error },
        { status: 401 }
      )
    }
  }

  try {
    const body = await request.json()
    const params = body as PostArtworkParams

    const result = await postMMAIArtwork(params, {
      requestId: request.headers.get('x-request-id'),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      source: 'api'
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { id: result.value.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in MM AI API:', error)
    return NextResponse.json(
      { error: { code: 'UNEXPECTED_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    )
  }
} 