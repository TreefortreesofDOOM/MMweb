# Portfolio Page Documentation

## Overview
The portfolio page serves as a dedicated, public-facing showcase for artists' work on Meaning Machine. It provides a curated, professional display of an artist's published artworks with advanced filtering and sorting capabilities.

## Route Structure
```
/artists/[id]/portfolio
```
- Dynamic route based on artist ID
- Public access (no authentication required)
- Separate from the artist's management dashboard
- Handles async route params for Next.js 13+ compatibility

### Important Implementation Notes
- Route params must be awaited before use (`const { id } = await params`)
- This applies to both metadata generation and the page component
- Ensures compatibility with Next.js 13+ dynamic route handling

## Component Architecture

### Server Components
`page.tsx`
- Handles data fetching from Supabase
- Implements metadata generation for SEO
- Error handling with notFound()
- Suspense boundaries for loading states
- Error boundaries for error handling

### Client Components
1. `portfolio-client.tsx`
   - Main client component for portfolio functionality
   - Manages state for filtered/sorted artworks
   - Handles real-time filtering and sorting
   - Integrates with Supabase client for dynamic queries

2. `portfolio-filters.tsx`
   - Filter controls for artwork refinement
   - Implements:
     - Text search
     - Medium/category filtering
     - Price range selection
     - Date range filtering
   - Uses debounced inputs for performance

3. `portfolio-sort.tsx`
   - Sorting controls for artwork organization
   - Options:
     - Display order (custom ordering)
     - Price (high to low/low to high)
     - Creation date
     - Title (alphabetical)

### Supporting Components
- `ArtistProfileCard`: Displays artist information
- `ArtworkGallery`: Grid layout for artwork display
- `Loading`: Skeleton loading state
- `ErrorBoundary`: Error handling component

## Data Flow
1. Server Component:
   - Fetches initial artist profile and artworks
   - Validates artist status (verified/emerging)
   - Passes data to client components

2. Client Components:
   - Transform initial data for gallery display
   - Handle user interactions (filtering/sorting)
   - Manage client-side state
   - Make dynamic queries to Supabase

## Features

### Filtering Capabilities
- Text search on artwork titles
- Medium/category filtering
- Price range selection
- Date range filtering
- Real-time updates

### Sorting Options
- Custom display order (default)
- Price sorting (ascending/descending)
- Creation date sorting
- Alphabetical title sorting

### Performance Optimizations
- Debounced search inputs
- Memoized calculations:
  - Price ranges
  - Unique mediums
  - Artwork gallery rendering
- Client-side caching
- Optimistic updates

### User Experience
- Mobile-responsive design
- Accessible controls
- Loading states
- Error handling
- Empty states
- Clear visual feedback

## Navigation Integration
- Available in main navigation for artists
- Dynamic URL handling with artist ID
- Integrated in both verified and emerging artist navigation
- Proper active state handling

## Database Integration
- Uses Supabase for data storage and queries
- Real-time filtering through database queries
- Published works only view
- Custom ordering support

## Error Handling
1. Server-side:
   - Not found handling
   - Invalid artist type handling
   - Database error handling

2. Client-side:
   - Query error handling
   - Empty state handling
   - Loading state management

## Performance Considerations
1. Server Component:
   - Efficient data fetching
   - Proper suspense boundaries
   - Metadata optimization

2. Client Components:
   - Debounced inputs
   - Memoized calculations
   - Optimized re-renders
   - Proper state management

## Future Enhancements
1. Additional Features:
   - Advanced filtering options
   - Bulk selection
   - Share functionality
   - Download options

2. Performance:
   - Image optimization
   - Pagination improvements
   - Cache strategies

3. Analytics:
   - View tracking
   - Interaction metrics
   - Performance monitoring

## Related Components
- Artist Profile Page
- Artwork Management
- Gallery View
- Navigation Components

## Usage Notes
- Portfolio page is public-facing
- Only published artworks are displayed
- Custom ordering is respected
- Accessible to both verified and emerging artists
- Integrated with artist verification system