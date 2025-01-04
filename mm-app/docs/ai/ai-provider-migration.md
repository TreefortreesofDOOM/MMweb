# AI Provider Migration

## Original Migration Strategy

### Phase 1: Interface Implementation ✅
- Define base `AIServiceProvider` interface
- Create provider-specific implementations
  - Gemini provider (completed with function calling)
  - ChatGPT provider (completed with vision and streaming)

### Phase 2: Adapter Implementation ✅
- Create adapters for specific functionalities:
  - Analytics adapter (completed)
  - Bio extraction adapter (completed)
  - Artwork analysis adapter (completed with unified-ai integration)

### Phase 3: Route Migration ✅
- Migrate existing routes to use unified client:
  - `/api/ai/analytics` ✅ (completed)
  - `/api/ai/analyze-artwork` ✅ (migrated with unified-ai panel)
  - `/api/ai/extract-bio` ✅ (migrated with unified-ai panel)

### Phase 4: Feature Analysis & Research ✅
- Document provider-specific features:
  - Function calling formats
  - Vision API capabilities
  - Rate limiting and quotas
  - Streaming implementations
  - Response formats
  - Error handling patterns
  - Token counting and limitations

- Feature Comparison Matrix:
  | Feature            | ChatGPT                | Gemini                |
  |--------------------|------------------------|-----------------------|
  | Function Calling   | Native support         | Custom implementation |
  | Vision             | GPT-4 Vision           | Gemini Vision        |
  | Embeddings         | text-embedding-3-small | Placeholder          |
  | Streaming          | Full support           | Basic support        |
  | Safety             | Internal moderation    | HarmCategory system  |
  | Rate Limits        | Tokens/min             | Requests/min         |
  | Cost Structure     | Per token              | Per character        |
  | Context Window     | 128K tokens            | 32K tokens           |
  | Thread Management  | Built-in               | Custom               |

## Current Implementation Status

### 1. ChatGPT Provider Implementation ✅
- Core functionality:
  ```typescript
  class ChatGPTProvider implements AIServiceProvider {
    // Messaging
    async sendMessage(message: Message): Promise<Response>
    async *streamMessage(message: Message): AsyncIterator<Response>
    
    // Function Calling
    registerFunctions(functions: AIFunction[]): void
    async executeFunctionCall(name: string, args: any): Promise<any>
    
    // Vision & Analysis
    async analyzeImage(image: ImageData): Promise<Analysis>
    async generateImageDescription(image: ImageData): Promise<string>
    
    // Embeddings
    async generateEmbeddings(text: string): Promise<Vector>
    
    // Configuration
    setTemperature(temperature: number): void
    setMaxTokens(maxTokens: number): void
    setSafetySettings(settings: Record<string, any>): void
  }
  ```

### 2. Key Features
- **Thread Management**
  - Automatic thread creation and cleanup
  - Context-aware thread reuse
  - Configurable thread expiry
  ```typescript
  private threadMap: Map<string, ThreadInfo>
  private threadExpiry: number // in milliseconds
  ```

- **Function Calling**
  - Support for both Assistants API and Chat Completions
  - Streaming function calls with real-time updates
  - Proper error handling and recovery

- **Vision Capabilities**
  - Structured image analysis with JSON output
  - Object detection and tagging
  - Base64 and URL image support
  ```typescript
  interface Analysis {
    description: string
    tags: string[]
    objects: {
      label: string
      confidence: number
      boundingBox?: BoundingBox
    }[]
  }
  ```

- **Streaming Support**
  - Real-time message streaming
  - Function call streaming
  - Proper error handling with fallback

### 3. Factory Integration ✅
```typescript
export type AIProviderConfig = {
  gemini: GeminiConfig
  chatgpt: ChatGPTConfig
}

class AIServiceFactory {
  static createProvider(config: AIConfig): AIServiceProvider {
    // Provider creation with fallback support
  }
}
```

## Implementation Progress

### Completed ✅
- Created base `AIServiceProvider` interface
- Implemented both providers:
  - Gemini provider with basic functionality
  - ChatGPT provider with full feature set
- Added unified-ai system
- Migrated all routes
- Implemented factory with fallback support
- Added proper error handling
- Implemented streaming support
- Added thread management
- Integrated vision capabilities

### In Progress 🚧
- Performance optimization:
  - Caching strategies
  - Request deduplication
  - State management efficiency
- Monitoring implementation:
  - Error tracking
  - Performance metrics
  - Usage analytics

### Deferred ⏳
- Test suite implementation
- Documentation updates
- Performance benchmarking
- Cost optimization

## Next Steps

### 1. Immediate Focus
- Monitor production performance
- Gather usage metrics
- Optimize resource usage

### 2. Future Enhancements
- Add caching layer
- Implement metrics collection
- Enhance error handling
- Add comprehensive testing

## Environment Configuration
```typescript
// Required environment variables:
interface ProcessEnv {
  OPENAI_API_KEY: string
  OPENAI_MODEL: string // defaults to 'gpt-4-turbo-vision'
  OPENAI_ASSISTANT_ID?: string
  OPENAI_THREAD_EXPIRY?: string // defaults to '24h'
}
```

## Notes
- ChatGPT provider is now fully implemented
- Both providers support the complete interface
- Factory supports seamless provider switching
- Fallback mechanism handles common error cases
- Thread management ensures efficient resource usage
- Vision capabilities are fully integrated
- Streaming support is implemented with proper error handling 