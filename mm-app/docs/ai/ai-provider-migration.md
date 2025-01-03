# AI Provider Migration Plan

## Current Implementation Analysis

Our current implementation is tightly coupled to Google's Gemini API with the following key components:

1. **Core AI Service** (`lib/ai/gemini.ts`):
   - Direct Gemini API integration
   - Function calling system
   - Safety settings
   - Image analysis capabilities
   - Chat history management

2. **Embeddings System** (`lib/ai/embeddings.ts`):
   - Currently using Gemini embeddings
   - Note: Supabase natively supports OpenAI embeddings
   - Need to align Gemini embeddings with OpenAI's format

3. **Bio Extractor** (`lib/ai/website-bio-extractor.ts`):
   - Uses Gemini for content analysis
   - Web scraping with content processing

4. **Personality System** (`lib/ai/personalities.ts`):
   - Provider-agnostic design
   - Can be reused in new architecture

## Migration Strategy

### Phase 1: Interface Implementation

1. **Create Provider Interface**:
```typescript
// lib/ai/providers/base.ts
interface AIServiceProvider {
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
}
```

2. **Implement Gemini Provider**:
```typescript
// lib/ai/providers/gemini.ts
class GeminiProvider implements AIServiceProvider {
  // Wrap existing Gemini implementation
  private gemini: GoogleGenerativeAI
  
  constructor(config: GeminiConfig) {
    this.gemini = new GoogleGenerativeAI(config.apiKey)
  }
  
  // Implement interface methods using existing code
}
```

### Phase 2: Adapter Implementation

1. **Create Response Adapters**:
```typescript
// lib/ai/adapters/gemini.ts
class GeminiAdapter {
  adapt(geminiResponse: any): StandardAIResponse {
    return {
      content: geminiResponse.text,
      type: this.determineType(geminiResponse),
      metadata: this.extractMetadata(geminiResponse)
    }
  }
}

// lib/ai/adapters/chatgpt.ts
class ChatGPTAdapter {
  adapt(chatGPTResponse: any): StandardAIResponse {
    return {
      content: chatGPTResponse.choices[0].message.content,
      type: this.determineType(chatGPTResponse),
      metadata: this.extractMetadata(chatGPTResponse)
    }
  }
}
```

### Phase 3: Factory Implementation

1. **Create Provider Factory**:
```typescript
// lib/ai/factory.ts
class AIServiceFactory {
  static createProvider(config: Config): AIServiceProvider {
    const chatGPT = new ChatGPTProvider(config.chatgpt)
    const gemini = new GeminiProvider(config.gemini)

    return new FallbackAIProvider(
      chatGPT,  // Primary
      gemini,   // Fallback
      config.fallbackOptions
    )
  }
}
```

### Phase 4: Provider Analysis & Research

1. **ChatGPT Specific Features**:
   - Research and document:
     - Function calling format and limitations
     - Vision API capabilities and requirements
     - Rate limiting and quotas
     - Streaming implementation details
     - Response formats and structures
     - Error handling patterns
     - Token counting and limitations

2. **Gemini Specific Features**:
   - Document current implementation:
     - Function calling system
     - Safety settings
     - Image analysis capabilities
     - Embedding dimensions
     - Rate limiting
     - Error patterns
     - Token handling

3. **Feature Comparison Matrix**:
   ```markdown
   | Feature            | ChatGPT                | Gemini                |
   |--------------------|------------------------|-----------------------|
   | Function Calling   | Different format       | Custom implementation |
   | Vision             | Separate API           | Integrated            |
   | Embeddings         | 1536 dimensions        | Different dimensions  |
   | Streaming          | SSE based              | AsyncIterator based   |
   | Safety             | Content filtering      | HarmCategory system   |
   | Rate Limits        | Tokens/min             | Requests/min          |
   | Cost Structure     | Per token              | Per character         |
   ```

4. **Implementation Gaps**:
   - Identify features unique to each provider
   - Document required adaptations
   - Plan fallback behavior for unsupported features
   - Define graceful degradation paths

### Phase 5: Adaptation Implementation

1. **Function Calling**:
   ```typescript
   // Example of provider-specific function calling
   interface FunctionCall {
     name: string;
     arguments: Record<string, any>;
   }

   // ChatGPT Implementation
   class ChatGPTFunctionAdapter {
     adaptFunctionCall(call: FunctionCall): OpenAIFunction {
       // Transform to OpenAI's function calling format
     }
   }

   // Gemini Implementation
   class GeminiFunctionAdapter {
     adaptFunctionCall(call: FunctionCall): GoogleTool {
       // Transform to Gemini's tool format
     }
   }
   ```

2. **Image Analysis**:
   ```typescript
   interface ImageAnalysis {
     description: string;
     tags: string[];
     objects: DetectedObject[];
   }

   // Provider-specific implementations
   class ChatGPTVisionAdapter implements ImageAnalyzer {
     // Use GPT-4 Vision API
   }

   class GeminiVisionAdapter implements ImageAnalyzer {
     // Use existing Gemini vision implementation
   }
   ```

3. **Safety & Moderation**:
   ```typescript
   interface SafetyCheck {
     category: string;
     threshold: number;
     action: 'allow' | 'warn' | 'block';
   }

   // Adapt safety settings per provider
   const safetyCrosswalk = {
     'harassment': {
       chatgpt: 'harassment',
       gemini: HarmCategory.HARM_CATEGORY_HARASSMENT
     },
     // ... other categories
   };
   ```

### Phase 6: Testing & Validation

1. **Feature Testing Matrix**:
   - Test each feature across providers
   - Document behavior differences
   - Validate fallback scenarios
   - Measure performance characteristics

2. **Integration Testing**:
   - End-to-end testing with both providers
   - Fallback scenario testing
   - Error handling validation
   - Performance benchmarking

3. **Provider-Specific Test Suites**:
   ```typescript
   describe('Provider Specific Features', () => {
     test('ChatGPT Function Calling', async () => {
       // Test OpenAI function calling format
     });

     test('Gemini Tool Execution', async () => {
       // Test Gemini tool execution
     });

     test('Cross-Provider Fallback', async () => {
       // Test fallback scenarios
     });
   });
   ```

## Migration Timeline

1. **Week 1-2: Interface Layer**
   - Create interfaces
   - Implement Gemini provider
   - Basic adapter implementation

2. **Week 3-4: Factory & Fallback**
   - Implement factory pattern
   - Set up fallback system
   - Configure monitoring

3. **Week 5-6: Database & Systems**
   - Update embedding system
   - Modify database schema
   - Update function calling

4. **Week 7-8: Testing & Deployment**
   - Implement test suite
   - Gradual rollout
   - Monitor performance

## Rollback Plan

1. **Quick Rollback**:
   ```typescript
   // Temporary rollback to Gemini-only
   class AIServiceFactory {
     static createProvider(config: Config): AIServiceProvider {
       return new GeminiProvider(config.gemini)
     }
   }
   ```

2. **Database Rollback**:
   ```sql
   -- Revert embedding table changes if needed
   ALTER TABLE artwork_embeddings_gemini 
   DROP COLUMN provider;
   ```

3. **Monitoring Points**:
   - Response latency
   - Error rates
   - Fallback frequency
   - Cost per provider

## Success Metrics

1. **Performance**:
   - Response time < 500ms
   - Fallback rate < 5%
   - Error rate < 1%

2. **Cost**:
   - 20% reduction in API costs
   - Optimal provider utilization

3. **Quality**:
   - Consistent response quality
   - Maintained user satisfaction
   - No degradation in key features 