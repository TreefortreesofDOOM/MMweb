# Patron (Collector) Role Documentation

## Overview
The patron role is designed for art collectors and enthusiasts who want to discover, collect, and engage with artists on the platform.

## MVP Definition
Core features required for initial release:
1. Basic patron profile with purchase history
2. Collection management (create, view, edit collections)
3. Artist following
4. Private gallery access
5. Basic analytics tracking

Dependencies:
- Artist role integration for following feature (emerging_artist && verified_artist)
- Feed system for artist updates [deferred]
- Messaging system for artist communication [deferred]

## Current Status

### ✅ Implemented Features
- Basic role structure and database integration
- Profile management with patron-specific views
- Ghost profile integration for previous purchasers
  - Profile claiming and merging
  - Purchase history tracking
  - Spending analytics
- Account Information Display
  - Total purchases tracking
  - Total spent tracking
  - Last purchase date
  - Email verification status
  - Profile editing capabilities
- Basic following functionality
  - Follow/unfollow artists
  - Database structure for follows

### 🚧 In Development
- Collection Management System
- Following System Enhancement
  - Following list view
  - Artist content feed
  - New artwork notifications
- Private Galleries Access
- Early Access Features
- AI Integration for Collectors

### 📋 Planned Features
- Direct messaging with artists [deferred]
- Feed system for following artists [requires-feed]
- Anonymous mode for patrons in settings. Allow patron to add a nome de plume to their anonymous mode profile.
- Market insights and analytics
- Collection showcase functionality

## Role Definition

### Core Features
Reference to features from role-selection-wizard.tsx:

#### Immediate Features
- Collect Art: Build personal art collections
- Message Artists: Direct communication with creators [deferred]
- Follow Artists: Stay updated with favorite artists [requires-feed]

#### Advanced Features
- Collection Management: Organize and showcase collections
- Early Access: Preview new artworks before release [requires artist to make it available before gallery show]
- Private Galleries: Access to exclusive collections

### Permissions
- Can view and purchase artworks
- Access to private gallery features
- Direct messaging with artists
- Collection management tools
- Early access to new releases
- Profile customization options

### Navigation Structure
- Browse Art: Discover new artworks
- My Collection: View and manage collected pieces [pending]
- Following: Track favorite artists [pending]
- Private Galleries: Access exclusive collections [pending]

## Technical Implementation

### 1. Directory Structure
```
app/
├── (protected)/
│   ├── patron/           # Patron-specific routes
│   │   ├── collection/   # Collection management
│   │   ├── following/    # Artist following
│   │   └── gallery/      # Private gallery access
components/
├── patron/
│   ├── collection/
│   │   ├── collection-card.tsx
│   │   └── collection-list.tsx
│   ├── following/
│   │   ├── following-list.tsx
│   │   └── following-card.tsx
│   └── gallery/
│       ├── gallery-card.tsx
│       └── gallery-list.tsx
lib/
├── actions/
│   └── patron-actions.ts  # Server actions for patron features
└── types/
    └── patron-types.ts    # Patron-specific type definitions
```

### 2. Core Types and Utilities
```typescript
// lib/types/patron-types.ts
import { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

// Role-specific features type utility
type RoleFeatures<T extends UserRole> = T extends 'patron'
  ? PatronFeatures
  : never;

interface PatronProfile extends Profile {
  role: Extract<UserRole, 'patron'>;
  total_purchases: number;
  total_spent: number;
  last_purchase_date?: string;
  ghost_profile_claimed: boolean;
}

interface PatronFeatures {
  canAccessPrivateGalleries: boolean;
  canMessageArtists: boolean;
  canCreateCollections: boolean;
}

// Utility function for role checks
export const isPatron = (profile: Profile): profile is PatronProfile => 
  profile?.role === 'patron';
```

### 3. Database Schema
```sql
-- Collections table
create table public.collections (
  id uuid primary key default uuid_generate_v4(),
  patron_id uuid references public.profiles(id),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  metadata jsonb default '{}'::jsonb,
  constraint unique_collection_name unique (patron_id, name)
);

-- Collection items table
create table public.collection_items (
  collection_id uuid references public.collections(id) on delete cascade,
  artwork_id uuid references public.artworks(id),
  added_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (collection_id, artwork_id)
);

-- Audit log table for critical actions
create table public.patron_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  patron_id uuid references public.profiles(id),
  action_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### 4. Security Implementation

#### Row Level Security (RLS)
```sql
-- Collections RLS
alter table public.collections enable row level security;

create policy "Users can view their own collections"
  on public.collections for select
  using (patron_id = auth.uid());

create policy "Users can insert their own collections"
  on public.collections for insert
  with check (patron_id = auth.uid());

create policy "Users can update their own collections"
  on public.collections for update
  using (patron_id = auth.uid());

-- Collection items RLS
alter table public.collection_items enable row level security;

create policy "Users can view their collection items"
  on public.collection_items for select
  using (
    collection_id in (
      select id from public.collections 
      where patron_id = auth.uid()
    )
  );
```

#### Error Handling
```typescript
// lib/utils/patron-error-handler.ts
export const handlePatronError = (error: Error, context: string) => {
  switch (context) {
    case 'private-gallery':
      return {
        title: 'Gallery Access Restricted',
        message: 'You need patron privileges to access this gallery.'
      };
    case 'collection':
      return {
        title: 'Collection Action Failed',
        message: 'Unable to modify collection. Please try again.'
      };
    default:
      return {
        title: 'Action Failed',
        message: 'An unexpected error occurred.'
      };
  }
};
```

### 5. Testing Strategy [deferred]
```typescript
// __tests__/patron/
describe('Patron Role', () => {
  describe('Access Control', () => {
    it('should restrict private gallery access to patrons');
    it('should allow patrons to create collections');
    it('should prevent duplicate collection names');
  });

  describe('Collection Management', () => {
    it('should create a new collection');
    it('should add artwork to collection');
    it('should remove artwork from collection');
  });

  describe('Artist Following', () => {
    it('should follow an artist');
    it('should unfollow an artist');
    it('should list followed artists');
  });
});
```

### 6. Integration with Platform Features

#### Following System
The patron role integrates with the platform-wide following system. See `docs/features/feed-system.md` for implementation details.

Key integration points:
- Following artists
- Viewing followed artists' content
- Receiving notifications about new artworks

## Development Phases

### Phase 1: Core Infrastructure (MVP)
1. Database schema implementation [✅ Complete]
2. Basic patron profile setup
3. Collection management
4. RLS policies
5. Route protection

### Phase 2: Feature Enhancement
1. Following system enhancement
   - Following list view ⏳ In Progress
   - Artist content feed ⏳ In Progress
   - New artwork notifications 📋 Planned
2. Private gallery access
3. Basic analytics integration
4. Audit logging

### Phase 3: Advanced Features
1. AI integration
2. Enhanced analytics
3. Social features
4. Messaging system [dependent on platform messaging]

## Best Practices
- Use `is_collector()` helper function for role checks [pending implementation]
- Implement proper route protection for collector features
- Consider collector-specific UI elements
- Maintain clear separation between browsing and collecting features
- Keep UI components simple and reusable
- Use server components for data fetching
- Implement proper error boundaries
- Follow TypeScript best practices
- Use Shadcn UI components

## Future Considerations
- Enhanced analytics dashboard
- Collection valuation tools
- Automated market insights
- Advanced curation tools
- Social features expansion



--
