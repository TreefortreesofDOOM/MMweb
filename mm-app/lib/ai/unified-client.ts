import { Message, Response, AIFunction, ImageData, Analysis, Vector, SearchResult, AIServiceProvider } from '@/lib/ai/providers/base'
import { AIServiceFactory, AIConfig } from '@/lib/ai/factory'
import { env } from '@/lib/constants/env'

// Default configuration using environment variables for provider selection
const defaultConfig: AIConfig = {
  primary: {
    provider: env.AI_PRIMARY_PROVIDER as 'chatgpt' | 'gemini',
    config: {
      apiKey: env.AI_PRIMARY_PROVIDER === 'chatgpt' ? env.OPENAI_API_KEY : env.GOOGLE_AI_API_KEY,
      model: env.AI_PRIMARY_PROVIDER === 'chatgpt' ? env.OPENAI_MODEL : env.GEMINI_TEXT_MODEL,
      temperature: 0.7,
      maxTokens: 2048,
      ...(env.AI_PRIMARY_PROVIDER === 'chatgpt' ? {
        threadExpiry: env.OPENAI_THREAD_EXPIRY,
        assistantId: env.OPENAI_ASSISTANT_ID
      } : {})
    }
  },
  ...(env.AI_FALLBACK_PROVIDER ? {
    fallback: {
      provider: env.AI_FALLBACK_PROVIDER as 'chatgpt' | 'gemini',
      config: {
        apiKey: env.AI_FALLBACK_PROVIDER === 'chatgpt' ? env.OPENAI_API_KEY : env.GOOGLE_AI_API_KEY,
        model: env.AI_FALLBACK_PROVIDER === 'chatgpt' ? env.OPENAI_MODEL : env.GEMINI_TEXT_MODEL,
        temperature: 0.7,
        maxTokens: 2048,
        ...(env.AI_FALLBACK_PROVIDER === 'chatgpt' ? {
          threadExpiry: env.OPENAI_THREAD_EXPIRY,
          assistantId: env.OPENAI_ASSISTANT_ID
        } : {})
      }
    }
  } : {}),
  fallbackOptions: {
    maxRetries: 3,
    fallbackTriggers: [
      'rate_limit_exceeded',
      'service_unavailable',
      'timeout',
      'context_length_exceeded',
      'model_not_available',
      'model_overloaded'
    ]
  }
}

export interface SendMessageOptions {
  temperature?: number
  maxTokens?: number
  functions?: AIFunction[]
  systemInstruction?: string
  context?: string
  imageUrl?: string
  chatHistory?: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
    name?: string
  }>
}

export class UnifiedAIClient {
  private provider: AIServiceProvider | null = null
  private functions: AIFunction[] = []

  constructor(config: Partial<AIConfig> = {}) {
    this.initializeProvider(config)
  }

  private async initializeProvider(config: Partial<AIConfig> = {}) {
    if (Object.keys(config).length > 0) {
      this.provider = await AIServiceFactory.createProvider({
        ...defaultConfig,
        ...config
      })
    } else {
      this.provider = await AIServiceFactory.createDefaultProvider()
    }
  }

  private async ensureProvider() {
    if (!this.provider) {
      await this.initializeProvider()
    }
    return this.provider!
  }

  async sendMessage(content: string, options: SendMessageOptions = {}): Promise<Response> {
    const provider = await this.ensureProvider()

    if (options.temperature) {
      provider.setTemperature(options.temperature)
    }
    if (options.maxTokens) {
      provider.setMaxTokens(options.maxTokens)
    }
    if (options.functions) {
      this.functions = options.functions
      provider.registerFunctions(options.functions)
    }

    const message: Message = {
      role: 'user',
      content,
      systemInstruction: options.systemInstruction,
      chatHistory: options.chatHistory,
      context: options.context,
      metadata: {
        imageUrl: options.imageUrl,
        functions: options.functions
      }
    }

    return provider.sendMessage(message)
  }

  async *streamMessage(content: string, options: SendMessageOptions = {}): AsyncIterator<Response> {
    const provider = await this.ensureProvider()

    if (options.temperature) {
      provider.setTemperature(options.temperature)
    }
    if (options.maxTokens) {
      provider.setMaxTokens(options.maxTokens)
    }
    if (options.functions) {
      this.functions = options.functions
      provider.registerFunctions(options.functions)
    }

    const message: Message = {
      role: 'user',
      content,
      systemInstruction: options.systemInstruction,
      chatHistory: options.chatHistory,
      context: options.context,
      metadata: {
        imageUrl: options.imageUrl
      }
    }

    return provider.streamMessage(message)
  }

  async registerFunctions(functions: AIFunction[]): Promise<void> {
    const provider = await this.ensureProvider()
    this.functions = functions
    provider.registerFunctions(functions)
  }

  async analyzeImage(image: ImageData): Promise<Analysis> {
    const provider = await this.ensureProvider()
    return provider.analyzeImage(image)
  }

  async generateImageDescription(image: ImageData): Promise<string> {
    const provider = await this.ensureProvider()
    return provider.generateImageDescription(image)
  }

  async generateEmbeddings(text: string): Promise<Vector> {
    const provider = await this.ensureProvider()
    return provider.generateEmbeddings(text)
  }

  async similaritySearch(query: string): Promise<SearchResult[]> {
    const provider = await this.ensureProvider()
    return provider.similaritySearch(query)
  }

  setTemperature(temperature: number): void {
    if (this.provider) {
      this.provider.setTemperature(temperature)
    }
  }

  setMaxTokens(maxTokens: number): void {
    if (this.provider) {
      this.provider.setMaxTokens(maxTokens)
    }
  }

  setSafetySettings(settings: Record<string, any>): void {
    if (this.provider) {
      this.provider.setSafetySettings(settings)
    }
  }

  async generateImage(prompt: string, options?: any): Promise<string> {
    const provider = await this.ensureProvider()
    return provider.generateImage(prompt, options)
  }
} 