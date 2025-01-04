import { BaseAdapter, StandardAIResponse } from './base'

// Define types based on our actual Gemini implementation
interface GeminiFunctionCall {
  name: string
  args: string | Record<string, any>
}

interface GeminiSafetyRating {
  category: string
  probability: string
}

interface GeminiResponse {
  text: () => string
  functionCalls: () => GeminiFunctionCall[]
  promptFeedback?: {
    safetyRatings?: GeminiSafetyRating[]
    blockReason?: string[]
  }
}

export class GeminiAdapter extends BaseAdapter {
  adapt(geminiResponse: GeminiResponse): StandardAIResponse {
    if (!geminiResponse) {
      return this.adaptError(new Error('Empty response from Gemini'))
    }

    try {
      // Extract function call if present
      const functionCalls = geminiResponse.functionCalls?.()
      const functionCall = functionCalls?.[0]

      return {
        content: geminiResponse.text(),
        type: functionCall ? 'function_call' : 'text',
        metadata: {
          provider: 'gemini',
          model: 'gemini-pro',
          safetyRatings: geminiResponse.promptFeedback?.safetyRatings,
          blockReason: geminiResponse.promptFeedback?.blockReason
        },
        functionCall: functionCall ? {
          name: functionCall.name,
          arguments: typeof functionCall.args === 'string' 
            ? JSON.parse(functionCall.args)
            : functionCall.args
        } : undefined
      }
    } catch (error) {
      return this.adaptError(error)
    }
  }

  adaptError(error: any): StandardAIResponse {
    // Check for specific Gemini error types
    const isRateLimitError = error.message?.includes('rate_limit_exceeded')
    const isQuotaError = error.message?.includes('quota_exceeded')
    const isBlockedError = error.message?.includes('blocked by safety settings')

    return {
      content: '',
      type: 'error',
      metadata: {
        provider: 'gemini',
        rateLimited: isRateLimitError,
        quotaExceeded: isQuotaError,
        blocked: isBlockedError
      },
      error: {
        message: error.message || 'Unknown Gemini error',
        code: this.determineErrorCode(error),
        details: error
      }
    }
  }

  private determineErrorCode(error: any): string {
    if (error.message?.includes('rate_limit_exceeded')) return 'RATE_LIMIT_EXCEEDED'
    if (error.message?.includes('quota_exceeded')) return 'QUOTA_EXCEEDED'
    if (error.message?.includes('blocked by safety settings')) return 'CONTENT_BLOCKED'
    if (error.message?.includes('Invalid argument')) return 'INVALID_ARGUMENT'
    return 'UNKNOWN_ERROR'
  }
} 