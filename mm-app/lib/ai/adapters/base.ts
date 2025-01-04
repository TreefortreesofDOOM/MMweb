import { Response, FunctionCall } from '../providers/base'

export interface StandardAIResponse {
  content: string
  type: 'text' | 'function_call' | 'error'
  metadata: Record<string, any>
  functionCall?: FunctionCall
  error?: {
    message: string
    code: string
    details?: any
  }
}

export interface AIResponseAdapter<T = any> {
  adapt(providerResponse: T): StandardAIResponse
  adaptStream(providerResponse: AsyncIterator<T>): AsyncIterator<StandardAIResponse>
  adaptError(error: any): StandardAIResponse
}

export abstract class BaseAdapter implements AIResponseAdapter {
  abstract adapt(providerResponse: any): StandardAIResponse
  
  async *adaptStream(providerResponse: AsyncIterator<any>): AsyncIterator<StandardAIResponse> {
    try {
      while (true) {
        const { value, done } = await providerResponse.next()
        if (done) break
        yield this.adapt(value)
      }
    } catch (error) {
      yield this.adaptError(error)
    }
  }
  
  adaptError(error: any): StandardAIResponse {
    return {
      content: '',
      type: 'error',
      metadata: {},
      error: {
        message: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN_ERROR',
        details: error
      }
    }
  }
  
  protected determineType(response: any): StandardAIResponse['type'] {
    if (response.functionCall) return 'function_call'
    if (response.error) return 'error'
    return 'text'
  }
} 