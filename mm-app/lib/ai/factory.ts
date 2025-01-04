import { AIServiceProvider, Message, Response, AIFunction, ImageData, Analysis, Vector, SearchResult } from './providers/base'
import { GeminiProvider, GeminiConfig } from './providers/gemini'

export type AIProvider = 'gemini' | 'chatgpt'

export type AIProviderConfig = {
  gemini: GeminiConfig;
  chatgpt: never; // Will be updated when ChatGPT is added
}

export interface AIConfig {
  primary: {
    provider: AIProvider
    config: AIProviderConfig[AIProvider]
  }
  fallback?: {
    provider: AIProvider
    config: AIProviderConfig[AIProvider]
  }
  fallbackOptions?: {
    maxRetries: number
    fallbackTriggers: string[]
  }
}

const DEFAULT_FALLBACK_OPTIONS = {
  maxRetries: 3,
  fallbackTriggers: [
    'rate_limit_exceeded',
    'service_unavailable',
    'timeout',
    'api_key_invalid',
    'api key not valid',
    'invalid api key'
  ]
}

export class AIServiceFactory {
  static createProvider(config: AIConfig): AIServiceProvider {
    const primaryProvider = AIServiceFactory.createSingleProvider(
      config.primary.provider,
      config.primary.config
    )

    if (!config.fallback) {
      return primaryProvider
    }

    const fallbackProvider = AIServiceFactory.createSingleProvider(
      config.fallback.provider,
      config.fallback.config
    )

    return new FallbackAIProvider(
      primaryProvider,
      fallbackProvider,
      {
        ...DEFAULT_FALLBACK_OPTIONS,
        ...config.fallbackOptions
      }
    )
  }

  private static createSingleProvider(
    provider: AIProvider,
    config: AIProviderConfig[AIProvider]
  ): AIServiceProvider {
    switch (provider) {
      case 'gemini':
        return new GeminiProvider(config as GeminiConfig)
      case 'chatgpt':
        throw new Error('ChatGPT provider not yet implemented')
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  }
}

interface FallbackOptions {
  maxRetries: number
  fallbackTriggers: string[]
}

class FallbackAIProvider implements AIServiceProvider {
  constructor(
    private primaryProvider: AIServiceProvider,
    private fallbackProvider: AIServiceProvider,
    private options: FallbackOptions = DEFAULT_FALLBACK_OPTIONS
  ) {}

  private shouldFallback(error: Error): boolean {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCause = (error.cause as any)?.reason?.toLowerCase() || '';
    
    return this.options.fallbackTriggers.some(trigger => 
      errorMessage.includes(trigger) || errorCause.includes(trigger)
    );
  }

  private async withFallback<T>(
    operation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof Error && this.shouldFallback(error)) {
        console.warn('Falling back to secondary provider:', {
          error: error.message,
          cause: error.cause
        })
        return await fallbackOperation()
      }
      throw error
    }
  }

  async sendMessage(message: Message): Promise<Response> {
    return this.withFallback(
      () => this.primaryProvider.sendMessage(message),
      () => this.fallbackProvider.sendMessage(message)
    )
  }

  async *streamMessage(message: Message): AsyncIterator<Response> {
    try {
      const iterator = this.primaryProvider.streamMessage(message)
      while (true) {
        const { value, done } = await iterator.next()
        if (done) break
        yield value
      }
    } catch (error) {
      if (error instanceof Error && this.shouldFallback(error)) {
        console.warn('Falling back to secondary provider for streaming:', {
          error: error.message,
          cause: error.cause
        })
        const fallbackIterator = this.fallbackProvider.streamMessage(message)
        while (true) {
          const { value, done } = await fallbackIterator.next()
          if (done) break
          yield value
        }
      } else {
        throw error
      }
    }
  }

  registerFunctions(functions: AIFunction[]): void {
    this.primaryProvider.registerFunctions(functions)
    this.fallbackProvider.registerFunctions(functions)
  }

  async executeFunctionCall(name: string, args: any): Promise<any> {
    return this.withFallback(
      () => this.primaryProvider.executeFunctionCall(name, args),
      () => this.fallbackProvider.executeFunctionCall(name, args)
    )
  }

  async analyzeImage(image: ImageData): Promise<Analysis> {
    return this.withFallback(
      () => this.primaryProvider.analyzeImage(image),
      () => this.fallbackProvider.analyzeImage(image)
    )
  }

  async generateImageDescription(image: ImageData): Promise<string> {
    return this.withFallback(
      () => this.primaryProvider.generateImageDescription(image),
      () => this.fallbackProvider.generateImageDescription(image)
    )
  }

  async generateEmbeddings(text: string): Promise<Vector> {
    return this.withFallback(
      () => this.primaryProvider.generateEmbeddings(text),
      () => this.fallbackProvider.generateEmbeddings(text)
    )
  }

  async similaritySearch(query: string): Promise<SearchResult[]> {
    return this.withFallback(
      () => this.primaryProvider.similaritySearch(query),
      () => this.fallbackProvider.similaritySearch(query)
    )
  }

  setSafetySettings(settings: Record<string, any>): void {
    this.primaryProvider.setSafetySettings(settings)
    this.fallbackProvider.setSafetySettings(settings)
  }

  setTemperature(temperature: number): void {
    this.primaryProvider.setTemperature(temperature)
    this.fallbackProvider.setTemperature(temperature)
  }

  setMaxTokens(maxTokens: number): void {
    this.primaryProvider.setMaxTokens(maxTokens)
    this.fallbackProvider.setMaxTokens(maxTokens)
  }
} 