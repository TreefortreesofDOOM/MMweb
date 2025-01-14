# Implementing New AI Features

This guide outlines best practices for implementing new AI features in our system, based on our portfolio analysis implementation.

## Architecture Overview

1. **Core Components**
   - `UnifiedAIClient`: Central interface for AI interactions
   - Feature-specific analyzers (e.g., `PortfolioAnalyzer`)
   - Type definitions for request/response data
   - Prompt templates in `instructions.ts`

2. **Directory Structure**
   ```
   mm-app/
   ├── lib/
   │   ├── ai/
   │   │   ├── unified-client.ts       # Core AI client
   │   │   ├── personalities.ts        # Personality system
   │   │   ├── instructions.ts         # Prompt templates
   │   │   ├── feature-analyzer.ts     # Feature-specific analyzer
   │   │   └── feature-types.ts        # Type definitions
   │   └── actions/
   │       └── ai-settings-actions.ts  # AI settings management
   └── app/
       └── api/
           └── ai/
               └── feature/
                   └── route.ts         # API endpoint
   ```

## Implementation Steps

1. **Define Types and Interfaces**
   ```typescript
   // feature-types.ts
   export type FeatureAnalysisType = 'type_1' | 'type_2' | /* ... */
   
   export interface FeatureAnalysisResult {
     type: FeatureAnalysisType
     status: 'success' | 'error'
     summary: string
     recommendations: string[]
     error?: string
   }
   ```

2. **Create Prompt Templates**
   ```typescript
   // instructions.ts
   export const FEATURE_ANALYSIS_PROMPTS = {
     type_1: (data: FeatureData) => `
       Analyze the following data...
       ${JSON.stringify(data)}
       Return ONLY raw JSON with "summary" and "recommendations" fields.
     `,
     // ... other prompt templates
   }
   ```

3. **Implement Feature Analyzer**
   ```typescript
   // feature-analyzer.ts
   export class FeatureAnalyzer {
     constructor(private client: UnifiedAIClient) {}

     async analyze(
       data: FeatureData,
       type: FeatureAnalysisType,
       options: AnalysisOptions
     ): Promise<FeatureAnalysisResult> {
       // 1. Validate inputs
       // 2. Get prompt template
       // 3. Send to AI with context
       // 4. Process and validate response
       // 5. Return structured result
     }
   }
   ```

4. **Create API Endpoint**
   ```typescript
   // route.ts
   export async function POST(request: Request) {
     // 1. Validate request data
     // 2. Get user context and role
     // 3. Initialize AI client with settings
     // 4. Collect necessary data
     // 5. Process analysis
     // 6. Return results
   }
   ```

## Best Practices

1. **Context Awareness**
   - Use the personality system via `context` parameter
   - Pass user role and preferences to adapt AI behavior
   - Include relevant page/route context

2. **Error Handling**
   - Validate all inputs thoroughly
   - Handle AI response parsing errors gracefully
   - Provide meaningful error messages
   - Log errors with sufficient context

3. **Type Safety**
   - Define strict types for all inputs/outputs
   - Use type guards for runtime validation
   - Avoid type assertions except when parsing external data

4. **AI Configuration**
   ```typescript
   const client = new UnifiedAIClient({
     primary: {
       provider: settings.primary_provider,
       config: {
         apiKey: env.OPENAI_API_KEY,
         model: env.OPENAI_MODEL,
         temperature: 0.7,
         maxTokens: 2048
       }
     },
     fallback: {/* fallback configuration */}
   })
   ```

5. **Response Processing**
   - Ensure AI returns valid JSON
   - Clean responses if needed (e.g., remove markdown)
   - Validate response structure matches expected type
   - Handle partial or invalid responses gracefully

## Using the Personality System

1. **Define Context**
   ```typescript
   const context = {
     route: '/feature/path',
     pageType: 'feature',
     persona: userRole === 'artist' ? 'mentor' : 'collector',
     data: {
       userId: user.id,
       // ... feature-specific data
     }
   }
   ```

2. **Pass Context to AI**
   ```typescript
   const response = await client.sendMessage(prompt, {
     temperature: options.temperature,
     maxTokens: options.maxTokens,
     context: JSON.stringify(context)
   })
   ```

## Testing and Validation

1. **Unit Tests**
   - Test input validation
   - Test prompt generation
   - Mock AI responses and test parsing
   - Test error handling paths

2. **Integration Tests**
   - Test with real AI responses
   - Verify personality system integration
   - Test fallback behavior
   - Validate end-to-end flow

## Security Considerations

1. **API Keys**
   - Never expose API keys in client-side code
   - Use environment variables for sensitive data
   - Implement proper key rotation

2. **User Authorization**
   - Validate user permissions
   - Check role-based access
   - Sanitize user inputs

3. **Rate Limiting**
   - Implement appropriate rate limits
   - Handle rate limit errors gracefully
   - Use fallback providers when needed 