# AI Provider Migration

## Current Implementation Analysis

The current AI implementation uses multiple providers and routes:

- `/api/ai/analytics` - Analytics route using Gemini (migrated to unified client)
- `/api/ai/analyze-artwork` - Artwork analysis route (removed)
- `/api/ai/extract-bio` - Bio extraction route (restored)

## Migration Strategy

### Phase 1: Interface Implementation ✅
- Define base `AIServiceProvider` interface
- Create provider-specific implementations
  - Gemini provider (in progress)
  - ChatGPT provider (planned)

### Phase 2: Adapter Implementation ✅
- Create adapters for specific functionalities:
  - Analytics adapter (completed)
  - Bio extraction adapter (completed)
  - Artwork analysis adapter (completed)

### Phase 3: Route Migration 🚧
- Migrate existing routes to use unified client:
  - `/api/ai/analytics` ✅ (completed)
  - `/api/ai/analyze-artwork` ✅ (removed)
  - `/api/ai/extract-bio` ✅ (restored)

### Phase 4: Feature Analysis & Research 📊
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
  | Function Calling   | Different format       | Custom implementation |
  | Vision             | Separate API           | Integrated           |
  | Embeddings         | 1536 dimensions        | Different dimensions |
  | Streaming          | SSE based              | AsyncIterator based  |
  | Safety             | Content filtering      | HarmCategory system  |
  | Rate Limits        | Tokens/min             | Requests/min         |
  | Cost Structure     | Per token              | Per character        |

### Phase 5: Adaptation Implementation 🔄
- Function Calling Adaptation:
  ```typescript
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

- Safety & Moderation:
  ```typescript
  interface SafetyCheck {
    category: string;
    threshold: number;
    action: 'allow' | 'warn' | 'block';
  }

  const safetyCrosswalk = {
    'harassment': {
      chatgpt: 'harassment',
      gemini: HarmCategory.HARM_CATEGORY_HARASSMENT
    },
    // ... other categories
  };
  ```

### Phase 6: Testing & Validation ⏳
- Test each migrated route
- Validate provider fallback mechanism
- Monitor error rates and performance
- Feature Testing Matrix:
  - Test each feature across providers
  - Document behavior differences
  - Validate fallback scenarios
  - Measure performance characteristics

## Progress

### Completed
- Created base `AIServiceProvider` interface
- Implemented Gemini provider (partial)
- Added analytics adapter with proper typing and error handling
- Migrated analytics route to use unified client
- Restored bio extraction route
- Added analytics type to `ANALYSIS_TYPES`

### In Progress
- Complete Gemini provider implementation
- Test analytics route with unified client
- Implement error monitoring
- Document provider-specific features
- Create feature comparison matrix

### Planned
- Implement ChatGPT provider
- Add fallback mechanism
- Performance monitoring
- Implement provider-specific adapters
- Create comprehensive test suite

## Implementation Timeline

### Week 1-2: Interface Layer
- Create interfaces
- Implement Gemini provider
- Basic adapter implementation

### Week 3-4: Factory & Fallback
- Implement factory pattern
- Set up fallback system
- Configure monitoring

### Week 5-6: Database & Systems
- Update embedding system
- Modify database schema
- Update function calling

### Week 7-8: Testing & Deployment
- Implement test suite
- Gradual rollout
- Monitor performance

## Rollback Plan

### Quick Rollback
```typescript
// Temporary rollback to Gemini-only
class AIServiceFactory {
  static createProvider(config: Config): AIServiceProvider {
    return new GeminiProvider(config.gemini)
  }
}
```

### Database Rollback
```sql
-- Revert embedding table changes if needed
ALTER TABLE artwork_embeddings_gemini 
DROP COLUMN provider;
```

### Monitoring Points
- Response latency
- Error rates
- Fallback frequency
- Cost per provider

## Success Metrics

### Performance
- Response time < 500ms
- Fallback rate < 5%
- Error rate < 1%

### Cost
- 20% reduction in API costs
- Optimal provider utilization

### Quality
- Consistent response quality
- Maintained user satisfaction
- No degradation in key features

## Notes
- Streaming functionality will be implemented in a future phase
- Focus on maintaining existing functionality during migration
- Error handling and validation added to analytics adapter 