import { Content } from "@google/generative-ai"

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  systemInstruction?: string
  chatHistory?: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  context?: string | Record<string, any>
  metadata?: Record<string, any>
}

export interface Response {
  content: string
  type?: 'text' | 'function_call'
  metadata: {
    provider: string
    model: string
    [key: string]: any
  }
  functionCall?: {
    name: string
    arguments: any
  }
}

export interface FunctionCall {
  name: string
  arguments: Record<string, any>
}

export interface AIFunction {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
  execute?: (args: any, context?: string) => Promise<any>
}

export interface ImageData {
  url?: string
  base64?: string
  mimeType?: string
}

export interface Analysis {
  description: string
  tags: string[]
  objects: DetectedObject[]
  metadata?: Record<string, any>
}

export interface DetectedObject {
  label: string
  confidence: number
  boundingBox?: BoundingBox
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface Vector {
  values: number[]
  dimensions: number
}

export interface SearchResult {
  id: string
  content: string
  similarity: number
  metadata?: Record<string, any>
}

export interface AIServiceProvider {
  // Core messaging
  sendMessage(message: Message): Promise<Response>
  streamMessage(message: Message): AsyncIterator<Response>
  
  // Function calling
  registerFunctions(functions: AIFunction[]): void
  executeFunctionCall(name: string, args: any): Promise<any>
  
  // Multimodal
  analyzeImage(image: ImageData): Promise<Analysis>
  generateImageDescription(image: ImageData): Promise<string>
  
  // Embeddings
  generateEmbeddings(text: string): Promise<Vector>
  similaritySearch(query: string): Promise<SearchResult[]>
  
  // Safety & Configuration
  setSafetySettings(settings: Record<string, any>): void
  setTemperature(temperature: number): void
  setMaxTokens(maxTokens: number): void
} 