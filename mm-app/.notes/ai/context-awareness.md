# AI Context Awareness System

## Overview
The context awareness system dynamically adapts the AI assistant's behavior based on:
- Current page/route
- User's role
- User's preferred AI personality
- Page-specific context

## Key Components

### 1. Context Types
```typescript
type ViewContext = 'general' | 'profile' | 'artwork' | 'gallery' | 'store' | 'collection' | 'portfolio'
```

Each context type has specific data and behaviors associated with it.

### 2. Personalities
- Located in `lib/ai/personalities.ts`
- Each personality (JARVIS, HAL9000, etc.) defines:
  - Speech patterns
  - Context-specific behaviors
  - Emotional tone
  - Quirks and responses

### 3. User Settings
- Users can choose their preferred AI personality
- Stored in user preferences
- Defaults to JARVIS if not set

## How It Works

1. **Page Context Detection**
```typescript
if (pathname.includes('/portfolio')) {
  pageType = 'portfolio'
  contextData = {
    userId: user?.id,
    isOwner: true
  }
}
```

2. **Persona Selection**
- Maps user roles to personas:
  - Admin → Advisor
  - Artist → Mentor
  - Patron → Collector

3. **Context Combination**
- Combines role-specific context with character personality
- Uses `getPersonalizedContext()` to get appropriate responses

4. **Assistant Mode Suggestion**
Different modes for different contexts:
- Profile → Bio extraction
- Portfolio → Portfolio analysis
- Artwork → Artwork analysis
- Gallery → Chat assistant

## Usage Example

```typescript
const { pageContext, suggestedAssistant } = useContextAwareness()

// pageContext contains:
{
  route: '/portfolio/123',
  pageType: 'portfolio',
  persona: 'mentor',
  personaContext: '...',
  characterPersonality: 'JARVIS',
  data: {
    userId: '123',
    isOwner: true
  }
}
```

## Extending the System

### Adding a New Context Type
1. Add to `ViewContext` type in `types.ts`
2. Add context detection in `useContextAwareness`
3. Add context behaviors to personalities
4. Add assistant mode suggestion if needed

### Adding a New Personality
1. Add to `PERSONALITIES` in `personalities.ts`
2. Define all required behaviors and patterns
3. Include context behaviors for all view types
4. Update environment variable types if needed

### Modifying Context Data
1. Update the `contextData` object in relevant route detection
2. Update `AIContext` interface if adding new fields
3. Update personality responses to use new context data

## Best Practices
1. Always use `getPersonalizedContext()` instead of direct access
2. Keep personality responses consistent with their character
3. Include all context types in new personalities
4. Handle async operations properly in context updates
5. Consider user role and permissions in context data

## Common Issues
1. Type errors from missing context types in personalities
2. Async state updates in context changes
3. Missing personality definitions for new contexts
4. Role/persona mapping inconsistencies 