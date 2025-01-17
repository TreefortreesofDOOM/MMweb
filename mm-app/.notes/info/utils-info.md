# Utils Structure and Usage Guide

## Directory Structure

```
@/lib/utils/
├── auth/           # Authentication and authorization utilities
├── artist/         # Artist-specific utilities
├── content/        # Content and media handling utilities
├── core/           # Core/common utilities used across the application
├── error/          # Error handling and logging utilities
└── user/           # User management utilities
```

## Core Utilities (`/core`)

Core utilities are fundamental helpers used throughout the application.

- `common-utils.ts`
  - `cn()`: Utility for conditional class name merging (powered by clsx/twMerge)
  - Used in: All UI components for dynamic class name handling

## Content Utilities (`/content`)

Handles content, media, and asset-related operations.

- `image-utils.ts`
  - `getImageUrl()`: Generates optimized image URLs
  - Used in: Image components, artwork displays, profile avatars

## Error Utilities (`/error`)

Error handling, logging, and error-specific utilities.

- `error-service.ts`
  - Error logging and tracking functionality
  - Used in: Global error boundaries, API routes, action handlers

## Auth Utilities (`/auth`)

Authentication and authorization related utilities.

- `auth-utils.ts`
  - Authentication state management
  - Session handling
  - Used in: Login/signup flows, protected routes

## Artist Utilities (`/artist`)

Artist-specific helper functions and utilities.

- `artist-utils.ts`
  - Artist data formatting
  - Portfolio management helpers
  - Used in: Artist profiles, portfolio views

## User Utilities (`/user`)

User management and user data handling utilities.

- `user-utils.ts`
  - User data formatting
  - Profile management helpers
  - Used in: User profiles, settings pages

## Best Practices

1. **File Organization**
   - Keep utilities grouped by domain/purpose
   - Use clear, descriptive file names
   - Include type definitions within utility files

2. **Naming Conventions**
   - Utility functions should be clear and descriptive
   - Use camelCase for function names
   - Prefix event handlers with 'handle'

3. **Type Safety**
   - All utilities should be properly typed
   - Export types when needed
   - Use strict type checking

4. **Error Handling**
   - Include proper error handling in utilities
   - Use custom error classes where appropriate
   - Provide meaningful error messages

5. **Documentation**
   - Include JSDoc comments for complex utilities
   - Document parameters and return types
   - Add usage examples for non-obvious cases

## Common Patterns

1. **Event Handlers**
   ```typescript
   const handleClick = (e: React.MouseEvent) => {
     // Implementation
   }
   ```

2. **Async Utilities**
   ```typescript
   const fetchData = async (): Promise<Data> => {
     // Implementation
   }
   ```

3. **Type Guards**
   ```typescript
   const isValidData = (data: unknown): data is ValidData => {
     // Implementation
   }
   ```

## Migration Guidelines

When moving or refactoring utilities:

1. Update all imports to reflect new paths
2. Maintain backwards compatibility when possible
3. Update tests to reflect changes
4. Document breaking changes

## Testing

- Each utility should have corresponding test file
- Test both success and error cases
- Mock external dependencies
- Include edge cases in tests 