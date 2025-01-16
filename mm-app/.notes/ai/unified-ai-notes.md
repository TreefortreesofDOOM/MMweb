## Unified AI System Analysis

Applied Rules:
- TypeScript Usage (explicit types, interfaces over types)
- State Management (React Context patterns)
- Error Handling (proper boundaries)
- Component Architecture (focused components)
- DRY & YAGNI principles

### Implementation Status Update (✅ = Fixed, 🚧 = In Progress, ⏳ = Pending)

#### 1. Type-Safe Persona Resolution ✅
- Added const assertions for `ASSISTANT_PERSONAS` and `PERSONA_MAPPING`
- Implemented discriminated unions for profile state
- Added proper null handling for optional fields
- Improved type safety for role-to-persona mapping
- Added proper type narrowing

#### 2. State Management Pattern ✅
- Added type-safe settings state with discriminated unions
- Implemented proper `AIPreferences` interface
- Created `DEFAULT_AI_SETTINGS` constant
- Removed unsafe optional chaining
- Added proper loading/error states

#### 3. Effect Pattern ✅
- Added ref tracking for latest state values
- Implemented proper cleanup on unmount
- Memoized complex computations
- Fixed race conditions
- Added proper dependency management

#### 4. Role & Type System Improvements ✅
- Fixed role type imports to use `UserRole` instead of `ArtistRole`
- Updated artist type derivation in chat context
- Improved type safety in AI search functionality
- Added proper role-based type checking
- Fixed profile type mismatches

Recent Changes:
- Fixed type error in `use-chat.ts` by properly deriving artist_type from role
- Updated AI search to use correct role types from custom-types
- Improved type safety in vertex AI integration
- Added proper null checks for optional profile fields

### Verified Fixes

1. **Type System**
   - ✅ Proper type assertions
   - ✅ Discriminated unions
   - ✅ Const assertions
   - ✅ Null safety

2. **State Management**
   - ✅ Loading states
   - ✅ Error states
   - ✅ Type-safe updates
   - ✅ Default values

3. **Performance**
   - ✅ Memoization
   - ✅ Dependency optimization
   - ✅ Race condition prevention
   - ✅ Cleanup handling

4. **Role System**
   - ✅ Proper role type usage
   - ✅ Type-safe role checks
   - ✅ Role-to-type mapping
   - ✅ Profile type alignment

### Next Steps

1. **Testing**
   - ✅ Manual testing completed
   - ⏳ Unit tests
   - ⏳ Integration tests
   - ⏳ Performance testing

2. **Documentation**
   - ✅ Type system updates
   - ✅ State management
   - ⏳ API documentation
   - ⏳ Usage examples

3. **Future Enhancements**
   - ⏳ Analytics integration
   - ⏳ Performance monitoring
   - ⏳ Error tracking
   - ⏳ Usage metrics

### System Architecture
```typescript
// Component Hierarchy (following component organization rules)
UnifiedAIProvider (context.tsx)
└─ UnifiedAI (unified-ai.tsx)
   └─ UnifiedAIChatView (unified-ai-chat-view.tsx)
      └─ useContextAwareness (use-context-awareness.ts)
```

### 1. Core State Interface
```typescript
interface UnifiedAIState {
  mode: AIMode
  isOpen: boolean
  isMinimized: boolean
  isCollapsed: boolean
  context: {
    conversation: Message[]
    analysis: AnalysisResult[]
    pageContext: AIContext
  }
}
```

### 2. Critical Issues

#### A. Type-Safe Persona Resolution
```typescript
// Non-compliant with TypeScript rules
const persona = profile?.artist_type ? 
  personaMapping[profile.artist_type as UserRole] : 
  personaMapping.user

// Should use proper discriminated union
interface ProfileState {
  status: 'loading' | 'error' | 'success'
  data?: {
    artist_type: UserRole
  }
  error?: Error
}
```

#### B. Role Value Mismatch Issue
```typescript
// Database values don't match type system
// In database: artist_type = 'verified'
// In code: ARTIST_ROLES.VERIFIED = 'verified_artist'

// Current implementation causing role check failures
const isVerifiedArtist = profile?.artist_type === ARTIST_ROLES.VERIFIED // false due to mismatch

// Two potential fixes:
// 1. Update database values (requires migration)
update profiles 
set artist_type = 'verified_artist' 
where artist_type = 'verified';

// 2. Update type system (simpler but needs thorough testing)
export const ARTIST_ROLES = {
  VERIFIED: 'verified',           // Match database value
  EMERGING: 'emerging_artist',
} as const

// Action Items:
// - Audit all role values in database
// - Ensure consistent role values across system
// - Add runtime validation for role values
// - Consider adding role value migration system

// Additional Role Mismatch Found in ArtistBadge:
interface ArtistBadgeProps {
  type: 'verified' | 'emerging';  // UI component expects different values
}
// But receiving ArtistRole from database:
type ArtistRole = 'verified' | 'emerging_artist'  // Database values

// Known Instances of Role Type Mismatches:
// 1. Dashboard Stripe Button Visibility
// File: mm-app/app/(protected)/artist/dashboard/dashboard-client.tsx
// Line: ~90 (Quick Actions section)
isVerifiedArtist && profile.stripe_account_id && profile.stripe_onboarding_complete
// Role check fails due to 'verified' vs 'verified_artist'

// 2. ArtistBadge Component Type Mismatch
// File: mm-app/components/ui/artist-badge.tsx
// Line: 8
interface ArtistBadgeProps {
  type: 'verified' | 'emerging';  // UI expects different values
}
// File: mm-app/app/(public)/artists/artist-card.tsx
// Line: ~40
const badgeType = artistType === ARTIST_ROLES.VERIFIED ? 'verified' : 'emerging';

// 3. Analytics Tracking
// File: mm-app/app/(public)/artists/artist-card.tsx
// Line: ~30
trackArtistView({
  artistType: artist.artist_type || '', // Raw database value
})

// 4. Role-Based Access Control
// File: mm-app/hooks/use-auth.ts
// Line: ~120
const isVerifiedArtist = profile?.artist_type === ARTIST_ROLES.VERIFIED;

// 5. AI Persona Selection
// File: mm-app/lib/ai/types.ts
// Persona mapping using artist_type directly from database

// 6. URL/Route Guards
// File: mm-app/middleware.ts
// Route protection checking artist_type

// 7. Artist Portfolio Display
// File: mm-app/app/(public)/artists/[id]/portfolio/page.tsx
// Conditional rendering based on artist.artist_type

// Impact Areas and File Patterns:
// - Feature Access: /app/(protected)/**/*.tsx
// - UI Components: /components/ui/*.tsx
// - Analytics: /lib/actions/analytics.ts
// - AI System: /lib/ai/**/*.ts
// - Route Guards: /middleware.ts, /lib/auth/*.ts
// - Database: /lib/types/database.types.ts

// Current workaround using inline mapping:
const badgeType = artistType === ARTIST_ROLES.VERIFIED ? 'verified' : 'emerging';
<ArtistBadge type={badgeType} />

// Proposed Solutions:
// 1. Create a central role mapping utility:
const mapArtistTypeToUIRole = (type: ArtistRole): 'verified' | 'emerging' => {
  return type === ARTIST_ROLES.VERIFIED ? 'verified' : 'emerging';
}

// 2. Update UI components to use same types as database
// 3. Consider creating a proper type hierarchy:
type DatabaseArtistRole = 'verified' | 'emerging_artist'
type UIArtistRole = 'verified' | 'emerging'
interface RoleMapping {
  [K in DatabaseArtistRole]: UIArtistRole
}
```

#### A.3 Role Consolidation Migration Plan

##### Phase 1: Audit & Preparation
```typescript
// 1. Database Tables to Update
- profiles (artist_type → role) ⏳ Pending
- artist_verification_requests (update status checks) ⏳ Pending
- artist_analytics (update role references) ⏳ Pending
- gallery_exhibitions (artist role checks) ⏳ Pending

// 2. Code Files to Update
// A. Core Types & Utils
- lib/types/database.types.ts (remove artist_type) ⏳ Pending database migration
- lib/types/custom-types.ts (remove ARTIST_ROLES, use UserRole) ✅ Complete
- lib/utils/role-utils.ts (update role checks) ✅ Complete

// B. Components
- components/ui/artist-badge.tsx (use UserRole) ✅ Complete
- components/artist/stripe-onboarding.tsx (role checks) ✅ Complete
- mm-app\app\(protected)\artist\verification\page.tsx (role checks) ✅ Complete
- app/(protected)/artist/dashboard/dashboard-client.tsx (role checks) ✅ Complete
- app/(public)/artists/artist-card.tsx (role display) ✅ Complete
- app/(protected)/profile/page.tsx (role handling) ✅ Complete

// C. Hooks & Context
- hooks/use-auth.ts (update isVerifiedArtist logic) ✅ Complete
- hooks/use-artist.ts (update role checks) ✅ Complete
- context/auth-context.tsx (update role handling) ✅ Complete

// D. API & Server Actions
- ✅ app/api/auth/[...nextauth]/route.ts (role assignments)
- ✅ lib/actions/artist.ts (verification logic)
- ✅ lib/actions/analytics.ts (role tracking)

// Phase 4 Progress Summary:
- Profile page role handling updated to use new role system ✅
- Removed deprecated ARTIST_ROLES usage ✅
- Using isAnyArtist utility from role-utils ✅
- Artist profile transformation properly typed ✅
```

##### Phase 2: Database Migration (Status Update)
- Migration Status: ✅ Complete
- File: mm-app/supabase/migrations/20240422000001_consolidate_artist_roles.sql

1. Profile Role Updates ✅
   - Successfully migrated artist_type values to role column
   - 'verified' -> 'verified_artist'
   - 'emerging' -> 'emerging_artist'

2. Column Cleanup ✅
   - Safely dropped artist_type column from profiles table

3. Role Validation ✅
   - Added trigger to validate role values
   - Enforces: 'admin', 'verified_artist', 'emerging_artist', 'patron', 'user'

4. Migration Verification ✅
   - Tested migration success
   - Confirmed no data loss
   - Verified role values are correctly updated

Next Steps:
1. Monitor for any role-related issues in production
2. Update documentation to reflect new role system
3. Clean up any remaining artist_type references in the codebase


##### Phase 3: Code Updates ✅

#### A. Role System Consolidation

1. Core Role Utilities (✅)
- Centralized role permissions in role-utils.ts
- Removed canAccessGallery from permissions (now controlled by exhibition_badge)
- Updated maxArtworks limits (verified: 100, emerging: 10)
- Added stripe requirements configuration
- Implemented proper type safety

2. Protected Routes (✅)
```typescript
export const PROTECTED_ROUTES = {
  '/artist/gallery': ['verified_artist'], // Exhibition badge required
  '/analytics': ['admin', 'verified_artist'],
  '/messaging': ['admin', 'verified_artist', 'patron']
} as const;
```

3. Feature Access (✅)
- Messaging: Admin, Verified Artists, Patrons
- Analytics: Admin, Verified Artists
- Gallery: Controlled by exhibition_badge
- Artwork Limits: 
  - Verified: 100
  - Emerging: 10
  - Others: 0

// 4. Implementation Status
✅ Role constants and types
✅ Permission configuration
✅ Route protection
✅ Feature access controls
✅ Gallery access separation (exhibition badge vs public showcase)
✅ Type safety improvements

#### B. Next Steps (Phase 4)
1. Analytics Updates
- ✅ Update role checks in profile page analytics
- ✅ Implement new role-based tracking in artist profile
- ✅ Migrate historical analytics data
  - Updated user_events table with new role values
  - Migrated verification events data
  - Updated event_data JSON fields
- ✅ Update analytics dashboard views
  - Added role-based feature access control
  - Updated sales/collector tabs for verified artists only
  - Added proper role checks using isVerifiedArtist
  - Conditional rendering of sales metrics
- 🚧 Add role transition tracking

2. UI Components
- ✅ Update profile page role handling
- ✅ Update artist profile card role display
- ✅ Implement proper role checks in verification banner
- ✅ Update ghost profile notification handling
- 🚧 Refresh role-based permission checks
- ⏳ Update navigation guards for new role system

3. Testing & Validation
- ✅ Verify role checks in profile page
- ✅ Test artist profile transformations
- ✅ Validate ghost profile handling
- ✅ Verify analytics data migration
- 🚧 Test role-based feature access
- ⏳ Add integration tests for role system
- ⏳ Performance testing for analytics updates

4. Documentation
- ✅ Update role system migration notes
- ✅ Document new profile page implementation
- ✅ Document analytics data migration
- 🚧 Update analytics tracking documentation
- ⏳ Add role transition guides
- ⏳ Update permission matrix docs

#### C. Dependency Chain
```
Database Schema (artist_role ENUM)
  └─ database.types.ts (Generated Types)
     └─ custom-types.ts (ARTIST_ROLES + ArtistRole)
        ├─ hooks/use-auth.ts (isVerifiedArtist)
        │  └─ All Protected Components
        ├─ components/ui/artist-badge.tsx
        │  └─ All Artist Display Components
        ├─ lib/ai/types.ts (Persona System)
        │  └─ AI Assistant Components
        └─ lib/actions/analytics.ts
           └─ Tracking Components
```

#### D. Impact Flow of Role Changes
1. **Database Layer**
   - Schema changes affect generated types
   - Migration required for value changes

2. **Type System Layer**
   - database.types.ts → Generated from schema
   - custom-types.ts → Depends on database types
   - Component types → Depend on custom types

3. **Application Layer**
   - Auth hooks → Role checks
   - UI Components → Display logic
   - Analytics → Tracking
   - AI System → Persona selection

4. **Protection Layer**
   - Middleware → Route guards
   - API Routes → Access control
   - Server Actions → Permissions

#### E. Change Requirements
When modifying roles:
1. Database migration
2. Regenerate types
3. Update constants
4. Update UI components
5. Update auth checks
6. Update analytics
7. Update AI system
8. Test all layers

#### F. Current Role Value Flow
```
Database ('verified')
  → Generated Types ('verified')
  → ARTIST_ROLES.VERIFIED ('verified_artist') ❌ Mismatch
  → UI Components ('verified') ❌ Another mismatch
```

This dependency map shows why a centralized fix is needed rather than point solutions.

### 3. Root Causes

#### A. State Management Issues
- Non-compliance with React Context patterns
- Missing proper state initialization
- Incomplete effect cleanup

#### B. Type System - Role and Persona System
```typescript
// 1. Database Layer - Source of Truth
type UserRole = 'admin' | 'verified_artist' | 'emerging_artist' | 'patron' | 'user'

// 2. AI Assistant Layer - Derived from UserRole + Context
const ASSISTANT_PERSONAS = {
  CURATOR: 'curator',    // Gallery/exhibition guidance
  MENTOR: 'mentor',      // Artist development
  COLLECTOR: 'collector', // Art appreciation/collection
  ADVISOR: 'advisor'     // Platform oversight
} as const

type AssistantPersona = typeof ASSISTANT_PERSONAS[keyof typeof ASSISTANT_PERSONAS]

// Base role-to-persona mapping
const PERSONA_MAPPING = {
  admin: ASSISTANT_PERSONAS.ADVISOR,
  emerging_artist: ASSISTANT_PERSONAS.MENTOR,
  verified_artist: ASSISTANT_PERSONAS.MENTOR,
  patron: ASSISTANT_PERSONAS.COLLECTOR,
  user: ASSISTANT_PERSONAS.COLLECTOR
} as const

// Personas can be adjusted based on context
// Example: A verified_artist viewing a gallery page might get
// a combination of MENTOR + CURATOR personas for better context
```

### Role and Persona System Evolution
- ✅ UserRole as single source of truth in database
- ✅ Context-aware persona selection
- 🚧 Persona combination system
- ⏳ Dynamic persona adjustment based on user behavior
- ⏳ Analytics for persona effectiveness

### Cleanup Needed
- 🚨 Remove outdated `AssistantRole` type in chat/route.ts (use AssistantPersona)
- 🚨 Remove legacy chat role values ('gallery', 'artist', 'patron', 'visitor')
- 🚨 Update any remaining role mappings to use PERSONA_MAPPING
- 🚨 Audit for any remaining hardcoded role strings

### Next Steps for Role-Persona System
1. Implement type-safe persona combination logic
2. Add context-based persona weighting
3. Create analytics for tracking persona effectiveness
4. Document persona selection criteria per context

### 4. Implementation Fixes

#### A. Context Provider Pattern
```typescript
interface UnifiedAIProviderProps {
  children: React.ReactNode
}

// Simplified Type Structure
// Single source of truth for roles
type UserRole = 'admin' | 'verified_artist' | 'emerging_artist' | 'patron' | 'user'

// Chat roles are mapped to AssistantPersona at runtime
function mapChatRoleToPersona(role: string): AssistantPersona {
    switch (role) {
        case 'gallery': return 'curator';
        case 'artist': return 'mentor';
        case 'patron': return 'collector';
        default: return 'curator';
    }
}

// Removed redundant AIRole type in favor of direct mapping to AssistantPersona
// This ensures type safety and eliminates role duplication
```

## Role System Migration Status

### Phase 1 Progress (✅ = Complete, 🚧 = In Progress, ⏳ = Pending)

#### Core Updates
- ✅ Removed `ARTIST_ROLES` constants
- ✅ Added role check helper functions (`isVerifiedArtist`, `isEmergingArtist`, etc.)
- ✅ Updated type imports across components
- ✅ Added proper TypeScript interfaces for artist data structures

#### Component Updates
- ✅ `ArtistBadge`: Updated to use `UserRole` directly
- ✅ `ArtistProvider`: Updated to use new role check functions
- ✅ `UserNav`: Updated to use `UserRole` and new badge component
- ✅ `ArtistCard`: Updated role checks and analytics tracking
- ✅ `ArtistProfileCard`: Updated to use `UserRole` and new badge component
- ✅ `ArtistSearch`: Moved to proper component directory and updated types
- ✅ `format-utils.ts`: Added proper TypeScript interfaces and type annotations

#### Auth Updates
- ✅ `useAuth`: Updated to use new role check functions
- ✅ Removed redundant role checks

#### Refactoring
- ✅ Moved artist-specific components to `components/artist/` directory
- ✅ Updated imports to use absolute paths
- ✅ Improved type safety with readonly properties
- ✅ Added proper TypeScript discriminated unions
- ✅ Fixed implicit 'any' type errors in array methods

#### Known Issues
1. Role Value Mismatch:
   - Database uses `artist_type = 'verified'`
   - Code expects `role = 'verified_artist'`
   - Current solution: Updated code to match database values

2. UI Component Type Mismatches:
   - `ArtistBadge` expects `'verified' | 'emerging'`
   - Database/role system uses different values
   - Solution: Added type mapping in components

### Next Steps
1. Database Migration (Phase 2): ✅
   - Plan database value standardization
   - Create migration scripts
   - Update existing records

2. Type System Enhancement (Phase 3):
   - Create central role type definitions
   - Implement proper type hierarchy
   - Add runtime type validation

3. Testing & Verification (Phase 4):
   - Add test coverage for role checks
   - Verify all role-gated features
   - Document role requirements

## Analytics System Regression Note

### Verification Progress Tracking
We identified a potential regression in the artist verification tracking system. The original implementation captured detailed metadata:

```typescript
trackArtistVerificationProgress({
  step: 'verification_complete',
  status: 'completed',
  metadata: {
    userId,
    verifiedAt: string,
    verificationDetails: {...}
  }
});
```

This was later simplified to:
```typescript
trackArtistVerificationProgress(userId: string, step: string)
```

**Action Items:**
- [ ] Review if this was an intentional simplification or accidental regression
- [ ] If regression, restore detailed tracking including metadata
- [ ] If intentional, document why we removed the detailed tracking
- [ ] Ensure analytics dashboards/reports haven't been affected