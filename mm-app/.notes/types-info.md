# Types System Documentation

## Overview
The MM Web application uses TypeScript for type safety and better developer experience. Our types are organized in the `mm-app/lib/types` directory and follow a modular approach where each domain has its own type definitions file.

## Key Principles
- Types are derived from database schema where possible
- Zod schemas are used for runtime validation
- Clear separation between database types and application types
- Consistent naming conventions (camelCase for properties, PascalCase for types)
- Documentation using JSDoc comments for complex types

## Type Files Structure

### Database Types (`database.types.ts`)
- Auto-generated from Supabase schema
- Source of truth for database table types
- Should not be manually edited

### Core Types (`custom-types.ts`)
- Base types derived from database schema
- Core interfaces like `Profile`, `Artwork`, `UserRole`
- Artist-specific interfaces (`ArtistFeatures`, `VerificationRequirements`)
- Extended types (`ArtworkWithArtist`, `ArtistProfile`)

### Error Handling (`gallery-error-types.ts`)
- Base error interface (`BaseErrorDetails`)
- Gallery-specific error codes
- Integration with error constants

### Feature-Specific Types

#### AI System (`mm-ai-types.ts`, `ai-settings-types.ts`)
- AI-related interfaces and types
- Settings configuration using Zod schemas
- Error handling specific to AI features

#### Gallery System (`gallery-types.ts`)
- Gallery show interfaces
- Wall types and status enums
- Date handling types
- Comprehensive show details interface

#### User Settings (`settings-types.ts`)
- Theme preferences
- Notification settings
- Role settings
- Update type utilities

#### Analytics (`analytics-types.ts`)
- Comprehensive metrics interfaces
- Performance tracking types
- Financial metrics
- User engagement data structures

#### Feed System (`feed-types.ts`)
- Feed item interfaces
- View structures
- Error handling

#### Search System (`search-artist-types.ts`)
- Search parameters
- Result types
- Cache handling

#### Patron System (`patron-types.ts`)
- Collection interfaces
- Transaction types
- Following system types

#### Ghost Profiles (`ghost-profiles-types.ts`)
- Anonymous user handling
- Payment status types
- Transaction interfaces

## Best Practices

### Type Derivation
```typescript
// Derive from database types
type Profile = Database['public']['Tables']['profiles']['Row']

// Extend with additional properties
interface ArtistProfile extends Profile {
  features: ArtistFeatures
}
```

### Zod Schema Usage
```typescript
// Define schema
export const userPreferencesSchema = z.object({
  theme: themeSchema,
  aiPersonality: aiPersonalitySchema,
})

// Infer type
export type UserPreferences = z.infer<typeof userPreferencesSchema>
```

### Error Handling
```typescript
export interface BaseErrorDetails {
  code: string
  field?: string
  message: string
}
```

## Type Safety Guidelines

1. Always use strict type checking
2. Avoid using `any` type
3. Use union types for finite sets of values
4. Leverage TypeScript utility types (Pick, Omit, etc.)
5. Document complex types with JSDoc comments

## Common Patterns

### Database Row Extension
```typescript
type DbArtwork = Database['public']['Tables']['artworks']['Row']
interface ArtworkWithDetails extends DbArtwork {
  artist: Profile
  stats: ArtworkStats
}
```

### Enum-like Constants
```typescript
export const GALLERY_SHOW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

export type GalleryShowStatus = typeof GALLERY_SHOW_STATUS[keyof typeof GALLERY_SHOW_STATUS]
```

### Generic Types
```typescript
export type CacheEntry<T = any> = {
  data: T
  timestamp: number
}
```

## Maintenance Guidelines

1. Keep types in sync with database schema
2. Update documentation when adding new types
3. Remove deprecated types when no longer used
4. Use TypeScript's strict mode
5. Run type checking before commits

## Type Migration Strategy

When updating types:
1. Mark old types as deprecated
2. Create new types with improved structure
3. Update usages gradually
4. Remove deprecated types after migration

## Tools and Utilities

- Database type generation: Supabase CLI
- Schema validation: Zod
- Type checking: TypeScript compiler
- Code quality: ESLint with TypeScript rules 