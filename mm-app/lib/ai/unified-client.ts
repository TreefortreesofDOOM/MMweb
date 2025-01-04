import { AIServiceFactory, AIConfig } from './factory'
import { Message, Response, AIFunction, ImageData, Analysis, Vector, SearchResult } from './providers/base'
import { env } from '@/lib/env'
import { Content } from '@google/generative-ai'
import { ChatGPTProvider } from './providers/chatgpt'

// Default configuration using ChatGPT as primary and Gemini as fallback
const defaultConfig: AIConfig = {
  primary: {
    provider: 'chatgpt',
    config: {
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL,
      temperature: 0.7,
      maxTokens: 2048,
      threadExpiry: env.OPENAI_THREAD_EXPIRY,
      assistantId: env.OPENAI_ASSISTANT_ID
    }
  },
  fallback: {
    provider: 'gemini',
    config: {
      apiKey: env.GOOGLE_AI_API_KEY,
      temperature: 0.7,
      maxOutputTokens: 2048,
      model: 'gemini-1.5-flash-latest'
    }
  },
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
  private provider = AIServiceFactory.createProvider(defaultConfig)
  private functions: AIFunction[] = []

  constructor(config: Partial<AIConfig> = {}) {
    if (Object.keys(config).length > 0) {
      this.provider = AIServiceFactory.createProvider({
        ...defaultConfig,
        ...config
      })
    }
  }

  async sendMessage(content: string, options: SendMessageOptions = {}): Promise<Response> {
    if (options.temperature) {
      this.provider.setTemperature(options.temperature)
    }
    if (options.maxTokens) {
      this.provider.setMaxTokens(options.maxTokens)
    }
    if (options.functions) {
      this.functions = options.functions
      this.provider.registerFunctions(options.functions)
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

    return this.provider.sendMessage(message)
  }

  async *streamMessage(content: string, options: SendMessageOptions = {}): AsyncIterator<Response> {
    if (options.temperature) {
      this.provider.setTemperature(options.temperature)
    }
    if (options.maxTokens) {
      this.provider.setMaxTokens(options.maxTokens)
    }
    if (options.functions) {
      this.functions = options.functions
      this.provider.registerFunctions(options.functions)
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

    return this.provider.streamMessage(message)
  }

  registerFunctions(functions: AIFunction[]): void {
    this.functions = functions
    this.provider.registerFunctions(functions)
  }

  async analyzeImage(image: ImageData): Promise<Analysis> {
    return this.provider.analyzeImage(image)
  }

  async generateImageDescription(image: ImageData): Promise<string> {
    return this.provider.generateImageDescription(image)
  }

  async generateEmbeddings(text: string): Promise<Vector> {
    return this.provider.generateEmbeddings(text)
  }

  async similaritySearch(query: string): Promise<SearchResult[]> {
    return this.provider.similaritySearch(query)
  }

  setTemperature(temperature: number): void {
    this.provider.setTemperature(temperature)
  }

  setMaxTokens(maxTokens: number): void {
    this.provider.setMaxTokens(maxTokens)
  }

  setSafetySettings(settings: Record<string, any>): void {
    this.provider.setSafetySettings(settings)
  }
} 