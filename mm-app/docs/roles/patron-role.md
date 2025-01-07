# Patron (Collector) Role Documentation

## Overview
The patron role's primary function is to maintain an automatic record of artworks purchased on Meaning Machine. When a patron buys an artwork, it's automatically added to their "Purchased Works" collection, creating an official record of ownership. As a secondary feature, patrons can also create custom collections for personal organization.

## MVP Definition
Core features required for initial release:
1. Basic patron profile with purchase history ✅
2. Collection management system ✅
3. Artist following system ✅
4. Private gallery access ✅
5. Basic analytics tracking ✅

Dependencies:
- Artist role integration for following feature ✅
- Feed system for artist updates [deferred]
- Messaging system for artist communication [deferred]

## Core Features

### Primary: Purchase Record
- Automatic tracking of purchased artworks ✅
- "Purchased Works" collection created on first purchase ✅
- System-managed collection that can't be edited manually ✅
- Serves as the patron's official digital art portfolio ✅
- Each artwork entry includes purchase date and details ✅

### Secondary: Custom Collections
- Optional organizational tool ✅
- Personal curation and wishlists ✅
- Can be used for planning future purchases ✅

## Current Status

### ✅ Completed Features

1. Database Schema & Server Actions
   - Added `collections` and `collection_items` tables ✅
   - Implemented Row Level Security (RLS) policies ✅
   - Added `is_purchased` flag and `display_order` column ✅
   - Collection CRUD operations ✅
   - Following system integration ✅
   - Purchase tracking and integration ✅
   - TypeScript type safety ✅
   - Optimized collection stats calculation ✅

2. Profile Management
   - Basic role structure and database integration ✅
   - Patron-specific views ✅
   - Ghost profile integration for previous purchasers ✅
   - Profile claiming and merging ✅
   - Account information display ✅
   - Email verification status ✅

3. Following System
   - Follow/unfollow artists ✅
   - Bi-directional following support ✅
   - Following list view ✅
   - Follower count tracking ✅

4. Collection Management UI
   - Collection creation form ✅
   - Collection list view ✅
   - Collection detail view ✅
   - Collection item grid with drag-and-drop ✅
   - Item sorting options ✅
   - Bulk selection and actions ✅
     - Move items between collections ✅
     - Update notes in bulk ✅
     - Remove multiple items ✅
   - Item notes and descriptions ✅
   - Loading states and error handling ✅
   - Keyboard accessibility ✅
   - Optimized image loading with blur placeholders ✅

5. Collection Privacy Controls
   - Public/private toggle ✅
   - Privacy settings dialog ✅
   - Visual indicators for visibility ✅

6. Collection Stats & Insights
   - Total collection value ✅
   - Average artwork price ✅
   - Unique artists count ✅
   - Collection age tracking ✅
   - Responsive stats display ✅
   - Server-side stats calculation ✅

7. Analytics Tracking and Metadata for Shared Collections
   - Added metadata generation for better social sharing ✅
     - Dynamic title and description
     - OpenGraph and Twitter card support 
     - Collection thumbnail from first artwork
     - Total value and artwork count in description
   
   - Created a collection views analytics system ✅
     - New collection_views table with RLS policies
     - Tracking of views, sources, and referrers
     - Analytics aggregation functions
     - Proper type definitions
   
   - Integrated view tracking in the public view ✅
     - Automatic tracking on component mount
     - Source tracking from URL parameters
     - Referrer tracking from browser
     - Non-blocking implementation
   
   - The analytics system tracks ✅
     - Total views
     - Unique viewers
     - Traffic sources
     - Recent activity
     - 30-day trends

8. Collection Sharing Features ✅

### Collection Share Dialog Component
- Provides a public URL for the collection ✅
- Includes a copy-to-clipboard button ✅
- Offers social media sharing options ✅
  - Twitter
  - Facebook
- Shows sharing details and privacy information ✅
- Is disabled for private collections ✅

### Public Collection View Route (`/collections/[id]`) ✅
- Shows a read-only view of the collection
- Returns 404 for private collections
- Includes collection stats and artwork grid
- Has a clean, focused layout for sharing

### Collection Detail View Integration ✅
- Added share button next to privacy controls
- Maintains consistent UI with other actions
- Shows clear visibility status

### 🚧 In Progress

1. UI Polish & Enhancements
   - [ ] Collection thumbnails
   - [ ] Advanced sorting/filtering
   - [ ] Collection insights graphs

### 📋 Next Steps (Priority Order)

1. UI/UX Improvements
   - Add collection cover images
   - Enhance sorting and filtering
   - Add data visualization

2. Additional Features
   - Collection categories/tags
   - Collection search
   - Export functionality
   - Collection templates

3. Testing & Validation
   - Unit tests for components
   - Integration tests for actions
   - E2E tests for critical flows
   - Performance testing

## Component Structure

app/
├── (protected)/
│   └── patron/
│       ├── collections/
│       │   ├── page.tsx # Collections list page ✅
│       │   ├── new/
│       │   │   └── page.tsx # New collection page ✅
│       │   └── [id]/
│       │       └── page.tsx # Collection detail page ✅
│       └── following/
│           └── page.tsx # Following list page ✅

components/patron/
├── collections/
│   ├── collection-list.tsx ✅
│   ├── collection-card.tsx ✅
│   ├── collection-detail.tsx ✅
│   ├── collection-item-grid.tsx ✅
│   ├── collection-privacy-settings.tsx ✅
│   ├── collection-stats.tsx ✅
│   ├── batch-operations-menu.tsx ✅
│   ├── move-items-dialog.tsx ✅
│   ├── bulk-notes-dialog.tsx ✅
│   └── edit-notes-dialog.tsx ✅
└── following/
    ├── following-list.tsx ✅
    └── artist-card.tsx ✅

## Implementation Guidelines

### State Management
- Use React Server Components where possible ✅
- Client components only when interactivity needed ✅
- Leverage Next.js App Router features ✅
- Use forms for data mutations ✅

### Data Flow
- Server actions for data mutations ✅
- Server components for initial data fetch ✅
- Client components for interactive features ✅
- Proper error boundaries and loading states ✅

### UI/UX Principles
- Consistent layout and spacing ✅
- Clear feedback for user actions ✅
- Proper loading states ✅
- Accessible components ✅
- Mobile-responsive design ✅

### Performance Optimizations
- Server-side collection stats calculation ✅
- Optimized image loading with Next.js Image ✅
- Proper image sizing and blur placeholders ✅
- Efficient batch operations ✅

### Technical Notes
- Purchase records are automatically maintained through database triggers ✅
- Custom collections are separate from the official purchase record ✅
- All operations are protected by RLS ✅
- TypeScript types ensure type safety throughout the system ✅

--
