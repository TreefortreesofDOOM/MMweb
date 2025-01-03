# Artists Page Documentation

## Overview
The artists page displays a directory of all verified and emerging artists in the system. It features infinite scrolling, search functionality, and advanced sorting/filtering capabilities.

## UI Components and Structure

### Page Layout
```
└── ArtistsPage (Server Component)
    └── ArtistsClient (Client Component)
        ├── SearchForm (Dynamic Client Component)
        │   ├── Search Input
        │   ├── Artist Type Select
        │   ├── Sort Field Select
        │   └── Sort Order Select
        └── Artist Grid
            └── ArtistCard (Repeated)
                ├── Avatar
                ├── Artist Info
                │   ├── Name
                │   ├── Location
                │   └── Bio
                ├── Role Badge (Verified/Emerging)
                ├── Exhibition Badge (if applicable)
                └── Artwork Count
```

### Component Details

#### ArtistCard
- Displays individual artist information in a card format
- Shows artist's avatar with fallback to initials
- Includes role and exhibition badges
- Displays location and truncated bio
- Shows artwork count
- Implements keyboard navigation between cards
- Tracks analytics on card interaction

#### Badge Components
- `ArtistBadge`: Shows verified/emerging status
- `ExhibitionBadge`: Indicates exhibition artist status
- Uses consistent styling and iconography
- Includes proper ARIA labels for accessibility

### UI/UX Features
- Responsive grid layout (1-4 columns based on screen size)
- Keyboard navigation support
- Loading skeletons during data fetches
- Smooth infinite scroll implementation
- Accessible form controls
- Error states with retry options
- Empty state handling

### Component Communication
1. **Data Flow**
   ```
   Server → ArtistsClient → ArtistCard
            ↓
   SearchForm ←→ ArtistsClient (State Updates)
   ```

2. **State Management**
   - Search/filter state managed in ArtistsClient
   - Passed to SearchForm via props
   - Updates trigger new data fetches
   - Results update artist grid display

## Sorting Logic

### Default Sorting
When no specific sorting is selected, artists are ordered by:

1. **Role Priority**
   - Verified artists appear first
   - Emerging artists appear second

2. **Exhibition Badge**
   - Within each role group, artists with exhibition badges appear first
   - Artists without exhibition badges appear second

3. **Creation Date**
   - Within each badge group, newest artists appear first
   - Uses the `created_at` timestamp

4. **ID**
   - As a final tiebreaker for consistent ordering
   - Ensures stable sorting when other fields are equal

### Custom Sorting
Users can customize sorting by:
- Date joined (created_at)
- Popularity (view_count)
- Name (full_name)

Each can be sorted in ascending or descending order.

## Pagination and State Management

### Initial Load
- Loads first 12 artists server-side
- Passes initial data to client component

### Infinite Scroll
- Fetches additional artists in batches of 12
- Maintains sorting consistency across pages
- Deduplicates artists to prevent repeats

### State Updates
When new artists are fetched:
1. Filters out any duplicate artists using ID comparison
2. Sorts unique artists using the same sorting logic
3. Appends sorted unique artists to the existing list

## Search and Filtering

### Text Search
- Debounced search input (300ms)
- Searches across artist names and details
- Resets pagination when search changes

### Type Filtering
- Can filter by artist role (Verified/Emerging)
- Maintains sorting within filtered results

## Error Handling
- Displays error messages with retry option
- Handles network errors and empty states
- Provides feedback during loading states

## Performance Considerations

### Component Optimization
- SearchForm loaded dynamically to reduce initial bundle
- ArtistCard uses memo to prevent unnecessary rerenders
- Images lazy loaded with next/image
- Avatar component handles image loading states

### State Management
- Uses refs for values that don't need rerenders
- Debounces search input to reduce API calls
- Maintains pagination state in refs
- Implements efficient deduplication

### Data Fetching
- Initial data fetched server-side
- Subsequent fetches handled client-side
- Implements request deduplication
- Caches results for 5 minutes

### Rendering Optimization
- Grid layout uses CSS Grid for performance
- Implements virtualization for large lists
- Defers non-critical UI updates
- Uses proper key props for list rendering

## Analytics Integration
- Tracks artist directory views
- Monitors search and filter usage
- Records artist profile clicks
- Measures user engagement metrics

## Accessibility Features
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Color contrast compliance
- Loading state announcements 

## Authentication and Route Access

### Public Route Handling
- Located in `app/(public)/artists/` directory
- Accessible to all users without authentication
- No session requirement for viewing artists

### Authentication States
1. **Unauthenticated Users**
   - Can view all artist profiles
   - Can search and filter artists
   - Can view artwork counts
   - Cannot follow artists
   - Cannot access private artist information

2. **Authenticated Users**
   - All public capabilities
   - Can follow/unfollow artists
   - Can view additional artist details
   - Can access direct messaging (if enabled)
   - Analytics tracks user interactions

3. **Authenticated Artists**
   - Cannot see follow button on own profile
   - Can see additional analytics on profile views
   - Special UI indicators for own profile

### Data Access Control
- Public data exposed through secure API routes
- Sensitive information filtered server-side
- Rate limiting applied to prevent abuse
- Cache strategies differ by auth state

### Security Considerations
- No sensitive data exposed in public routes
- API routes validate session tokens
- Protected actions require authentication
- Client-side permissions checked before UI renders
- Server-side validation for all protected actions 