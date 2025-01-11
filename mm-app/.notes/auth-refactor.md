# Authentication System Refactoring

## Current Architecture

The application uses three Supabase client patterns:

1. **Server Components**
```typescript
import { createClient } from '@/lib/supabase/supabase-server'
const supabase = await createClient()
```

2. **Server Actions**
```typescript
import { createActionClient } from '@/lib/supabase/supabase-action'
const supabase = await createActionClient()
```

3. **Client Components**
```typescript
import { createBrowserClient } from '@/lib/supabase/supabase-client'
const supabase = createBrowserClient()
```

## Issues Identified

1. **Authentication Issues**
   - Inconsistent client initialization patterns
   - Custom cookie handling (should be handled by Supabase)
   - Inconsistent error handling across different auth implementations
   - Multiple components implementing their own auth state management
   - `auth-context.tsx` relies on external `use-auth` hook instead of managing state directly
   - Missing proper TypeScript discriminated unions for auth states
   - No handling of auth state persistence
   - Missing proper loading states for initial auth check
   - **Direct Supabase Auth Usage**: Many components bypass auth-context:
     - Server Actions (`social.ts`, `settings.ts`, `collection-actions.ts`, etc.)
     - Utility Functions (`patron-utils.ts`, `auth-utils.ts`)
     - Hooks (`use-user.ts`, `use-auth.ts`)

2. **Server-Side Issues**
   - Direct auth calls in server actions need proper client initialization:
     - `lib/actions/profile.ts`
     - `lib/actions/role.ts`
     - `lib/actions/settings.ts`
     - `lib/actions/social.ts`
     - `lib/actions/patron/collection-actions.ts`
   - No unified approach to server-side auth
   - Repetitive error handling patterns
   - Missing proper TypeScript return types

3. **Client-Side Issues**
   - `hooks/use-user.ts` duplicates auth context functionality
   - Missing proper SSR handling
   - Inconsistent error handling
   - Multiple components bypass the centralized auth context
   - Missing TypeScript discriminated unions for error states
   - Missing proper error boundaries

4. **Utility Function Issues**
   - Non-standard file naming in `lib/utils/patron-utils.ts`
   - Missing centralized auth utilities for common patterns
   - Inconsistent approach to auth-required operations
   - Missing proper error handling in utilities

## Recommendations

### 1. Client Initialization

Create three standard client utilities:

```typescript
// lib/supabase/supabase-server.ts
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// lib/supabase/supabase-action.ts
export async function createActionClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// lib/supabase/supabase-client.ts
export function createBrowserClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}
```

Use these patterns consistently throughout the application:

1. **Server Components**
```typescript
import { createClient } from '@/lib/supabase/supabase-server'
const supabase = await createClient()
```

2. **Server Actions**
```typescript
import { createActionClient } from '@/lib/supabase/supabase-action'
const supabase = await createActionClient()
```

3. **Client Components**
```typescript
import { createBrowserClient } from '@/lib/supabase/supabase-client'
const supabase = createBrowserClient()
```

All patterns use `@supabase/ssr` under the hood with appropriate cookie handling for their context. The service role client (`service-role.ts`) should only be used for admin operations that require elevated privileges.

## Implementation Plan

### 1. Current Codebase Analysis
```
Current Structure:
mm-app/
├── hooks/
│   ├── use-auth.ts        # Main auth hook (4.6KB)
│   └── use-user.ts        # Redundant user hook (1.1KB)
├── lib/
│   ├── auth/
│   │   ├── admin.ts       # Admin-specific auth
│   │   ├── agent.ts       # Agent-specific auth
│   │   └── auth-utils.ts  # Basic utils
│   └── supabase/         # Well-structured, keep as is
       ├── supabase-action.ts
       ├── supabase-server.ts
       ├── supabase-client.ts
       └── supabase-action-utils.ts
```

### 2. Migration Strategy

#### Phase 1: Foundation (No Breaking Changes)
1. Create new directory structure:
```
mm-app/
├── components/
│   └── providers/
│       └── auth-provider.tsx    # NEW: Central auth state
├── lib/
│   └── auth/
       ├── server/              # NEW: Server-side logic
       │   └── auth-utils.ts    # Migrated from current
       ├── client/              # NEW: Client-side logic
       │   └── auth-utils.ts    # NEW: From use-auth.ts
       └── types/              # NEW: Shared types
```

2. Move and consolidate types:
- Extract types from `use-auth.ts`
- Create proper discriminated unions
- Define shared interfaces

#### Phase 2: Provider Implementation
1. Create auth provider using existing logic
2. Maintain current hook API initially
3. Add proper error boundaries
4. Implement proper cleanup

#### Phase 3: Hook Migration
1. Update `use-auth.ts` to use provider
2. Deprecate `use-user.ts`
3. Update dependent hooks:
   - `use-artist.ts`
   - `use-verification.ts`
   - `use-feature-access.ts`

#### Phase 4: Component Updates
1. Add provider to app root
2. Update key components:
   - Auth flows
   - Protected routes
   - Admin interfaces

### 3. Testing Strategy

1. **Unit Tests**
- Auth provider
- Hook behavior
- Type safety
- Error handling

2. **Integration Tests**
- Auth flows
- Session management
- Role-based access

3. **Performance Tests**
- Re-render behavior
- Bundle size impact
- State updates

### 4. Rollback Strategy

1. **Monitoring Points**
- Auth success rates
- Error rates
- Performance metrics

2. **Rollback Triggers**
- Auth failures
- Performance degradation
- Type errors

### 5. Success Criteria

1. **Code Quality**
- Reduced duplication
- Clear type definitions
- Proper error handling
- Consistent patterns

2. **Performance**
- No regression in auth flows
- Maintained bundle size
- Efficient state updates

3. **Maintenance**
- Single source of truth
- Clear separation of concerns
- Documented patterns

### 6. Future Considerations

1. **Scalability**
- Additional auth providers
- Role system expansion
- Permission system updates

2. **Security**
- Regular audits
- Token management
- Rate limiting 

### Files to Migrate

#### 1. Core Auth Files
```
Priority 1 - Core Authentication:
├── hooks/
│   ├── use-auth.ts             # Migrate to provider pattern
│   └── use-user.ts             # Remove (deprecated)
├── lib/
│   └── auth/
       ├── auth-utils.ts        # Split into server/client
       ├── admin.ts             # Move to server/
       └── agent.ts             # Move to server/
```

#### 2. Dependent Hooks
```
Priority 2 - Dependent Hooks:
├── hooks/
│   ├── use-artist.ts           # Update to use new auth provider
│   ├── use-verification.ts     # Update to use new auth provider
│   ├── use-feature-access.ts   # Update to use new auth provider
│   └── use-favorites.ts        # Update to use new auth provider
```

#### 3. Components Using Auth
```
Priority 3 - Components:
├── components/
│   ├── social/
│   │   └── follow-button.tsx   # Already using useAuthContext
│   ├── settings/
│   │   └── settings-form.tsx   # Update auth import
│   ├── ui/
│   │   └── hero.tsx           # Update auth import
│   └── unified-ai/
       └── unified-ai-chat-view.tsx  # Update auth import
```

#### 4. Server-Side Auth Usage
```
Priority 4 - Server Files:
├── lib/
│   ├── actions/
│   │   ├── auth.ts            # Update client usage
│   │   ├── profile.ts         # Update client usage
│   │   ├── social.ts          # Update client usage
│   │   └── verification.ts    # Update client usage
│   └── emails/
       └── artist-notifications.ts  # Update client usage
```

#### 5. Utility Files
```
Priority 5 - Utils:
├── lib/
│   ├── analytics/
│   │   └── analytics.ts       # Update client usage
│   └── utils/
       ├── search-utils.ts     # Update client usage
       └── patron-utils.ts     # Update client usage
```

### Migration Notes

1. **No Changes Needed**
- Supabase client initialization files (well-structured)
- Script files using direct Supabase client

2. **Breaking Changes**
- `use-user.ts` will be removed
- `auth-utils.ts` will be split
- Auth imports will change

3. **Backward Compatibility**
- Keep old imports working during migration
- Add deprecation notices
- Maintain type compatibility