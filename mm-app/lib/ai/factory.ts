import { AIServiceProvider, Message, Response, AIFunction, ImageData, Analysis, Vector, SearchResult } from './providers/base'
import { GeminiProvider, GeminiConfig } from './providers/gemini'
import { ChatGPTProvider, ChatGPTConfig } from './providers/chatgpt'
import { env } from '@/lib/env'
import { createClient } from '@/lib/supabase/supabase-server'

export type AIProvider = 'gemini' | 'chatgpt'

export type AIProviderConfig = {
  gemini: GeminiConfig;
  chatgpt: ChatGPTConfig;
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
    'invalid api key',
    'context_length_exceeded',
    'model_not_available',
    'model_overloaded'
  ]
}

export class AIServiceFactory {
  private static async getAISettings() {
    const supabase = await createClient()
    const { data: settings } = await supabase
      .from('ai_settings')
      .select('*')
      .single()

    return settings || {
      primary_provider: env.AI_PRIMARY_PROVIDER,
      fallback_provider: env.AI_FALLBACK_PROVIDER
    }
  }

  private static getProviderConfig(provider: AIProvider): AIProviderConfig[AIProvider] {
    switch (provider) {
      case 'gemini':
        return {
          apiKey: env.GOOGLE_AI_API_KEY,
          model: env.GEMINI_TEXT_MODEL,
          temperature: 0.7,
          maxOutputTokens: 2048,
        } as GeminiConfig
      case 'chatgpt':
        return {
          apiKey: env.OPENAI_API_KEY,
          model: env.OPENAI_MODEL,
          temperature: 0.7,
          maxTokens: 2048,
          threadExpiry: env.OPENAI_THREAD_EXPIRY,
          assistantId: env.OPENAI_ASSISTANT_ID,
        } as ChatGPTConfig
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  }

  static async createDefaultProvider(): Promise<AIServiceProvider> {
    const settings = await AIServiceFactory.getAISettings()
    
    const config: AIConfig = {
      primary: {
        provider: settings.primary_provider as AIProvider,
        config: AIServiceFactory.getProviderConfig(settings.primary_provider as AIProvider)
      }
    }

    if (settings.fallback_provider) {
      config.fallback = {
        provider: settings.fallback_provider as AIProvider,
        config: AIServiceFactory.getProviderConfig(settings.fallback_provider as AIProvider)
      }
    }

    return AIServiceFactory.createProvider(config)
  }

  static createProvider(config: AIConfig): AIServiceProvider {
    console.log('Creating AI provider with config:', {
      primaryProvider: config.primary.provider,
      fallbackProvider: config.fallback?.provider
    })

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
    console.log(`Creating provider: ${provider}`, {
      hasApiKey: !!config.apiKey,
      model: config.model,
      config: { ...config, apiKey: '[REDACTED]' }
    });

    switch (provider) {
      case 'gemini':
        return new GeminiProvider(config as GeminiConfig)
      case 'chatgpt':
        return new ChatGPTProvider(config as ChatGPTConfig)
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
  ) {
    console.log('Initializing FallbackAIProvider', {
      primaryProvider: primaryProvider.constructor.name,
      fallbackProvider: fallbackProvider.constructor.name,
      fallbackTriggers: options.fallbackTriggers
    });
  }

  private shouldFallback(error: Error): boolean {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCause = (error.cause as any)?.reason?.toLowerCase() || '';
    
    const shouldFallback = this.options.fallbackTriggers.some(trigger => 
      errorMessage.includes(trigger) || errorCause.includes(trigger)
    );

    console.log('Checking if should fallback:', {
      errorMessage,
      errorCause,
      shouldFallback,
      triggers: this.options.fallbackTriggers
    });

    return shouldFallback;
  }

  private async withFallback<T>(
    operation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    try {
      console.log('Attempting primary provider operation');
      return await operation()
    } catch (error) {
      console.error('Error in primary provider:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : error,
        cause: error instanceof Error ? error.cause : undefined,
        stack: error instanceof Error ? error.stack : undefined
      });
      
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

  async generateImage(prompt: string, options?: any): Promise<string> {
    return this.withFallback(
      () => this.primaryProvider.generateImage(prompt, options),
      () => this.fallbackProvider.generateImage(prompt, options)
    )
  }
} 