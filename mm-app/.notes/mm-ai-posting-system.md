# MM AI Posting System

## Overview
Implementation plan for enabling the Meaning Machine AI admin account to post content to the feed, following DRY principles, TypeScript best practices, accessibility requirements, and proper server/client separation.

## System Components

### 1. Server Components

#### Database Structure
- Uses existing `artworks` table with early permission checks
- Uses existing RLS policies with MM AI admin role
- MM AI profile UUID: `00000000-0000-4000-a000-000000000001`

#### Server Actions
```typescript
// app/api/admin/mm-ai/actions.ts
'use server'

export const postMMAIArtwork = async (
  params: PostArtworkParams,
  metadata?: AgentMetadata
): Promise<Result<Artwork, MMAIError>> => {
  // Early returns for validation
  const validationResult = await validateParams(params)
  if (validationResult.isErr()) {
    return err(validationResult.error)
  }

  // Early returns for accessibility checks
  const accessibilityResult = await validateAccessibility(params)
  if (accessibilityResult.isErr()) {
    return err(accessibilityResult.error)
  }

  // Implementation...
}

export const scheduleMMAIPost = async (
  params: PostArtworkParams,
  scheduledFor: Date
): Promise<Result<ScheduledPost, MMAIError>> => {
  // Similar pattern with early returns
}
```

#### API Routes
```typescript
// app/api/admin/mm-ai/post/route.ts
import { NextRequest } from 'next/server'
import { validateAuth } from '@/lib/auth'
import { postMMAIArtwork } from '../actions'

export async function POST(req: NextRequest) {
  // Early return for auth
  const authResult = await validateAuth(req, 'admin')
  if (authResult.isErr()) {
    return Response.json(
      { error: authResult.error },
      { status: 401 }
    )
  }

  // Process request
  const data = await req.json()
  const result = await postMMAIArtwork(data)
  
  if (result.isErr()) {
    return Response.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return Response.json(result.value)
}
```

#### Server-Side Validation
```typescript
// lib/validation/mm-ai-validation.ts
export const validateParams = async (
  params: PostArtworkParams
): Promise<Result<ValidatedParams, ValidationError>> => {
  // Server-side validation logic
}

export const validateAccessibility = async (
  params: PostArtworkParams
): Promise<Result<void, AccessibilityError>> => {
  // Server-side accessibility checks
}
```

### 2. Client Components

#### Admin Interface
```typescript
// app/(protected)/admin/mm-ai/post/page.tsx
export default function AdminPostPage() {
  return (
    <AdminPostForm />
  )
}

// components/admin/mm-ai/post-form.tsx
'use client'

const AdminPostForm = () => {
  const [isPending, startTransition] = useTransition()
  
  const handleSubmit = async (data: FormData) => {
    startTransition(async () => {
      const result = await postMMAIArtwork({
        // Form data transformation
      })
      
      if (result.isErr()) {
        // Client-side error handling
      }
    })
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields with proper accessibility */}
    </form>
  )
}
```

#### Type Definitions
```typescript
// lib/types/admin/mm-ai-types.ts

// Shared between client and server
interface PostArtworkParams {
  title: string
  images: Array<{
    url: string
    alt: string // Required for accessibility
  }>
  description?: string
  tags?: string[]
  aiGenerated: boolean
  prompt?: string
}

// Server-only types
interface ServerPostArtworkParams extends PostArtworkParams {
  readonly userId: string
  readonly timestamp: Date
}

// Client-only types
interface PostFormState {
  isPending: boolean
  errors?: Record<string, string>
  success?: boolean
}
```

### 3. Error Handling

#### Error Types
- Authentication errors
- Validation errors
- Rate limiting errors
- Image processing errors
- Database errors
- Agent-specific errors

#### Recovery Strategy
- Automatic retries for transient failures
- Error logging with context
- Admin notifications for critical failures
- Fallback content for agent errors

### 4. Monitoring

#### Metrics
- Post success/failure rates
- Queue length and processing times
- Error rates by type
- Agent performance metrics
- Content engagement metrics

#### Alerts
- Critical failures
- Rate limit warnings
- Queue backlog alerts
- Agent performance degradation

### 5. Testing Strategy [deferred]

#### Unit Tests
- Input validation
- Permission checks
- Error handling
- Type safety

#### Integration Tests
- End-to-end posting flow
- Agent API integration
- Image processing
- Scheduling system

#### Agent-Specific Tests
- Prompt validation
- Content quality checks
- Performance benchmarks
- Error recovery

## Implementation Phases

### Phase 1: Server Infrastructure
1. Set up server actions with proper 'use server' directives
2. Implement server-side validation
3. Add server-side auth checks
4. Create API routes with proper error handling

### Phase 2: Client Integration
1. Create client components with 'use client' directives
2. Implement form handling with proper loading states
3. Add client-side validation
4. Set up error boundaries

## Security Considerations

### API Keys
- Separate keys for admin and agent access
- Regular key rotation
- Access logging
- IP restrictions

### Content Validation
- Image safety checks
- Content moderation
- Prompt validation
- Metadata verification

### Rate Limiting
- Per-endpoint limits
- Burst allowance
- IP-based restrictions
- Agent-specific quotas

## Best Practices

### Server/Client Separation
- Clear 'use server' and 'use client' directives
- Proper server actions implementation
- Client-side state management
- Server-side validation
- Type safety across boundaries

### Code Organization
- Early returns for validation and error checks
- Clear type definitions with discriminated unions
- Proper error propagation with Result types
- DRY principle in shared utilities

### TypeScript Usage
- Strict type checking enabled
- No any types
- Proper type guards
- Discriminated unions for type safety
- Readonly types where applicable

### Accessibility
- Required alt text for images
- ARIA attributes in responses
- Screen reader considerations
- Keyboard navigation support
- Color contrast validation

### Error Handling
- Early returns for validation
- Type-safe error handling
- Proper error propagation
- Detailed error messages
- Recovery strategies

### Performance
- Efficient image processing
- Proper caching strategies
- Early validation to prevent unnecessary processing
- Background processing for heavy tasks

### Testing [deferred]
- Type-safe test cases
- Accessibility testing
- Error case coverage
- Performance benchmarks 