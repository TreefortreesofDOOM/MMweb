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
- Fixed OpenAI model configuration
- Implemented proper fallback provider logic
- Added detailed logging for provider operations
- Added admin interface for provider configuration:
  - Dynamic primary/fallback provider selection
  - Real-time provider switching
  - Database-backed settings persistence
  - Role-protected access control

### Environment Configuration ✅
```env
# AI Provider Selection
AI_PRIMARY_PROVIDER=chatgpt|gemini  # Default: chatgpt
AI_FALLBACK_PROVIDER=chatgpt|gemini  # Optional fallback

# Provider-specific Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_THREAD_EXPIRY=24h
OPENAI_ASSISTANT_ID=asst_...

GOOGLE_AI_API_KEY=...
GEMINI_TEXT_MODEL=gemini-1.5-flash-latest
```

### Database Schema ✅
```sql
create table if not exists ai_settings (
  id uuid primary key default uuid_generate_v4(),
  primary_provider text not null check (primary_provider in ('chatgpt', 'gemini')),
  fallback_provider text check (fallback_provider in ('chatgpt', 'gemini')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Only allow one active settings row
create unique index if not exists ai_settings_singleton on ai_settings ((true));
```

### Next Steps
- [ ] Add provider-specific configuration options to admin interface
- [ ] Implement provider performance monitoring
- [ ] Add usage analytics and cost tracking
- [ ] Implement automated provider health checks
- [ ] Add support for additional AI providers

## Environment Configuration
```typescript
// Required environment variables:
interface ProcessEnv {
  OPENAI_API_KEY: string
  OPENAI_MODEL: string // e.g., 'gpt-4', 'gpt-4-turbo-preview'
  OPENAI_ASSISTANT_ID?: string
  OPENAI_THREAD_EXPIRY?: string // defaults to '24h'
  GOOGLE_AI_API_KEY: string
  GEMINI_TEXT_MODEL: string
  GEMINI_VISION_MODEL: string
  AI_PRIMARY_PROVIDER: 'chatgpt' | 'gemini' // defaults to 'chatgpt'
  AI_FALLBACK_PROVIDER?: 'chatgpt' | 'gemini' // optional fallback provider
}
```

## Provider Configuration
The system now supports dynamic provider selection through environment variables:

1. **Primary Provider Selection**
   - Set `AI_PRIMARY_PROVIDER` to either 'chatgpt' or 'gemini'
   - Default is 'chatgpt' if not specified
   - Example: `AI_PRIMARY_PROVIDER=gemini`

2. **Fallback Provider Selection**
   - Set `AI_FALLBACK_PROVIDER` to configure a fallback provider
   - Optional - if not set, no fallback will be used
   - Must be different from the primary provider
   - Example: `AI_FALLBACK_PROVIDER=chatgpt`

3. **Provider-Specific Configuration**
   - ChatGPT provider requires:
     - `OPENAI_API_KEY`
     - `OPENAI_MODEL`
     - `OPENAI_ASSISTANT_ID` (optional)
     - `OPENAI_THREAD_EXPIRY` (defaults to '24h')
   - Gemini provider requires:
     - `GOOGLE_AI_API_KEY`
     - `GEMINI_TEXT_MODEL`
     - `GEMINI_VISION_MODEL`

4. **Example Configuration**
   ```env
   # Primary Provider (Gemini)
   AI_PRIMARY_PROVIDER=gemini
   GOOGLE_AI_API_KEY=your-gemini-api-key
   GEMINI_TEXT_MODEL=gemini-1.5-flash-latest
   GEMINI_VISION_MODEL=gemini-1.5-vision-latest

   # Fallback Provider (ChatGPT)
   AI_FALLBACK_PROVIDER=chatgpt
   OPENAI_API_KEY=your-openai-api-key
   OPENAI_MODEL=gpt-4
   OPENAI_ASSISTANT_ID=asst_xxx
   OPENAI_THREAD_EXPIRY=24h
   ```

## Fallback Configuration
The system supports automatic fallback between providers with the following configuration:

```typescript
const fallbackTriggers = [
  'rate_limit_exceeded',
  'service_unavailable',
  'timeout',
  'context_length_exceeded',
  'model_not_available',
  'model_overloaded'
]
```

When the primary provider encounters any of these errors, the system automatically falls back to the secondary provider while maintaining the same interface and functionality.

## Notes
- Primary and fallback providers can be configured via environment variables
- Both providers support the complete interface
- Factory supports seamless provider switching
- Fallback mechanism handles common error cases
- Thread management ensures efficient resource usage
- Vision capabilities are fully integrated
- Streaming support is implemented with proper error handling
- Detailed logging added for debugging and monitoring 