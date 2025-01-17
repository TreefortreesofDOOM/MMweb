# Gallery Events Implementation Guide

## Implementation Status

### Completed ✅
- Database Schema
  - Gallery wall types enum
  - Gallery fields in artworks table
  - Gallery shows table
  - Gallery show artworks junction table
  - Gallery dates table
  - RLS policies for security
- Components
  - Wall Type Select component
  - Admin Calendar component
    - Click and drag selection for multiple dates
    - Preview of selected dates
    - Pending changes with save confirmation
    - Timezone-aware date handling
  - Gallery Badge component
  - Show Approval List component
    - Tabbed interface for pending/approved shows
    - Approval status tracking with timestamps
    - Admin attribution for approvals
    - Visual artwork previews
  - Artwork Selector (with wall type integration)
  - Gallery Show Form
- Pages
  - Artist Gallery Page (`/artist/gallery`) with tabs for shows and wall placement
  - Admin Gallery Page (`/gallery-management`) with calendar and show approvals
  - Admin Dashboard integration with quick access to gallery management
- Server Actions & API Routes
  - Gallery show status management (`/api/gallery/shows`)
  - Calendar date management (`/api/gallery/dates`)
  - Proper authentication and admin role checks
  - Error handling with appropriate status codes
- Features
  - Show approval workflow integration
  - Price management for gallery artworks
  - Calendar date availability management
  - Admin review interface for gallery shows
- Error Handling
  - Standardized error types and codes
  - Type-safe error handling with proper TypeScript types
  - Form-specific error handling with field mapping
  - Client-side error boundaries for gallery components
  - User-friendly error messages and recovery options
  - Consistent error handling across gallery actions

### Not Started ❌
- Features
  - Email notifications for show status changes [deferred]
  - Gallery analytics
  - Artist dashboard gallery statistics [deferred]
  - Show attendance tracking [deferred]

## Developer Guide

### Architecture Overview
The gallery system is built on three main pillars:
1. **Database Layer**: Supabase with RLS policies for security
2. **API Routes**: Type-safe endpoints for data mutations
3. **UI Components**: React components with proper error boundaries

### Key Patterns

#### 1. Data Flow
- Use API routes for all data mutations
- Implement proper validation before database operations
- Handle errors at the source with specific error types
- Use transactions for multi-step operations

#### 2. Error Handling
- All errors should extend `GalleryError`
- Use error codes from `GALLERY_ERROR_CODES`
- Implement field-level error mapping in forms
- Wrap components with error boundaries

#### 3. Component Architecture
- Maintain separation between UI and logic
- Use form validation with Zod schemas
- Implement proper loading and error states
- Follow accessibility guidelines

#### 4. Security
- All database access through RLS policies
- Validate user permissions in API routes
- Implement proper role checks
- Sanitize all user inputs

### Working with Gallery Shows

#### Creation Flow
1. Artist selects available dates
2. Chooses artworks and sets wall types
3. Submits for admin approval
4. Admin reviews and approves/rejects

#### Approval Process
1. Admin reviews show details in tabbed interface
2. Can approve or reject shows
3. Approval status tracked with timestamps
4. Admin attribution recorded

### Calendar Management

#### Date Availability
1. Admin marks available dates through intuitive interface
2. Click and drag support for multiple date selection
3. Preview of selected dates before saving
4. Proper timezone handling
5. Pending changes system with save confirmation

### Best Practices

#### 1. Error Handling
- Always use typed error codes
- Provide user-friendly error messages
- Implement proper error recovery
- Log errors appropriately

#### 2. State Management
- Use React Query for server state
- Implement optimistic updates
- Handle loading states gracefully
- Maintain proper cache invalidation

#### 3. Form Handling
- Use Zod for schema validation
- Implement proper field validation
- Handle async validation properly
- Show clear error messages

#### 4. Testing
- Test error scenarios
- Validate form submissions
- Check calendar interactions
- Verify approval workflows

### Future Considerations
1. **Analytics Integration**
   - Track show performance
   - Monitor artwork engagement
   - Analyze visitor patterns

2. **Email Notifications**
   - Status change notifications
   - Reminder system
   - Marketing communications

3. **Dashboard Enhancements**
   - Artist performance metrics
   - Show success tracking
   - Visitor analytics

### Maintenance Guidelines
1. Keep error codes up to date
2. Maintain type safety
3. Update documentation
4. Monitor performance
5. Regular security audits 