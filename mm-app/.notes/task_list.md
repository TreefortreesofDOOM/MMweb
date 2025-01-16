# Task List

## Mobile Responsiveness testing and fixing
   - [ ] Test on mobile devices
   - [ ] Fix any issues
   - [ ] Add mobile responsiveness to all components
   - [ ] Add mobile responsiveness to all pages
   - [ ] SideNav and unified-ai drawer should be mobile responsive. On desktop they should push the content. On mobile they should go over the content. 

## Bugs

- the count does not work on admin dashboard for pending applications.
- upload image progress bar does not have animation.

# Minor Features
- In the application process. Send a link to the user's pubilc portfolio with the application. Make sure the user knows it's being sent. 

## High Priority

- [ ] Instead of Collection Age, on collection page in the collection data detail, show time since last transaction. We want to subtly encourage them to add more art to their collection. Rekindle their art buying habits.

### AI
   - [ ] Integration with Gallery Systems: Connect the analyzer with gallery management systems to automatically update metadata, enhance search functionalities, and improve user experiences.
   - [ ] **Auto-Generating Artwork Titles** 
      - Have a feature that auto-generates or suggests titles for artworks that are missing or have low-quality. The user can then accept or tweak them. Inside the edit artwork page. 

### Stripe
- [ ] Implement email notifications for Stripe events:
   - Purchase confirmation to buyer
   - Sale notification to artist
   - Use email templates and resend.com integration
   - Add proper error handling for failed notifications

### Recommendation Engine
- There is no way to browse or follow collectors. We should think about how to implement this.

   **Basic Details** (needs more detail and design)
   - We should recommend patrons to artists they might like based on an analysis of their collection and artist's content.
   - We should also recommend artists to patrons they might like based on an analysis of their collection and artist's content.
   - We should also recommend patrons to each other based on an analysis of their collection and each other's content.
   **Components**
   - [ ] Add a component in the MainNav header for notifications.

### Patron Collection View Improvements
1. Error Handling
   - [ ] Implement ErrorBoundary wrapper for CollectionDetail
   - [ ] Add granular error handling for collection operations
   - [ ] Improve error messages and recovery flows

2. Type Safety
   - [ ] Add explicit return types for all functions
   - [ ] Implement stricter type guards for collection data
   - [ ] Add proper discriminated unions for operation types

## Medium Priority

### Email System
   - [ ] Move email templates to a separate file
   - [ ] Add proper error handling for email sending
   - [ ] Add email preview functionality for admins
   - [ ] Add email sending queue for reliability
   - [ ] Add email templates for:
   - [ ] Welcome email
   - [ ] Password reset
   - [ ] Email verification
   - [ ] Complete domain verification for meaningmachine.com in Resend
   - [ ] Update email sender from `onboarding@resend.dev` to `noreply@meaningmachine.com` in:
   - `app/api/test-email/route.ts`
   - `utils/emails/artist-notifications.ts`
   **Email Templates** (needs more detail and design)

   #### Artist Application Approval
   ```html
   <h2>Congratulations!</h2>
   <p>Your application to become an artist on Meaning Machine has been approved.</p>
   <p>You can now access the artist features and start uploading your artwork.</p>
   <p>Welcome to the Meaning Machine community!</p>
   ```

   #### Artist Application Rejection
   ```html
   <h2>Application Update</h2>
   <p>Thank you for your interest in becoming an artist on Meaning Machine.</p>
   <p>After careful review, we regret to inform you that we cannot approve your application at this time.</p>
   <p><strong>Reason:</strong> {rejectionReason}</p>
   <p>You're welcome to apply again in the future.</p>
   ```

### Patron Collection View Improvements
1. Documentation
   - [ ] Add JSDoc comments for all components
   - [ ] Document prop types thoroughly
   - [ ] Add usage examples in comments
   - [ ] Create component API documentation

2. Performance Optimizations
   - [ ] Implement proper memoization for CollectionItemGrid
   - [ ] Optimize re-renders with React.memo
   - [ ] Add loading state improvements
   - [ ] Implement proper Suspense boundaries

## Low Priority

### Artist Management
- [ ] Add commission request system

### General
   - [ ] Add proper error handling throughout the application
   - [ ] Add loading states for all actions
   - [ ] Add proper TypeScript types for all components
   - [ ] Add unit tests
   - [ ] Add end-to-end tests 

### Improvements
1. DRY Improvements
   - [ ] Create shared utilities for common operations
   - [ ] Refactor duplicate logic in batch operations
   - [ ] Standardize error handling patterns

2. Accessibility Enhancements
   - [ ] Add missing ARIA labels
   - [ ] Improve keyboard navigation
   - [ ] Enhance focus management
   - [ ] Add screen reader announcements for operations

### Gallery System Enhancements
1. Analytics Integration
   - [ ] Implement show performance tracking
   - [ ] Add artwork engagement metrics
   - [ ] Create visitor pattern analysis system
   - [ ] Build analytics dashboard for gallery insights

2. Email Notification System
   - [ ] Implement show status change notifications
   - [ ] Create reminder system for upcoming shows
   - [ ] Add marketing communication templates
   - [ ] Set up automated email triggers

3. Artist Dashboard Improvements
   - [ ] Add performance metrics for gallery shows
   - [ ] Implement show success tracking
   - [ ] Create visitor analytics dashboard
   - [ ] Build historical performance trends

### Admin Features
   - [ ] Add user management

## Completed

### Gallery Events
- [x] Need to work on setting up a gallery artist with the tools to add everything we need to show their work in our physical gallery. 
   - [x] Artist needs to classify their work that align with the gallery's various walls.
      - [x] Add to database and backend. Flagging artwork with 'trust_wall', 'collectors_wall', 'added_value_pedestal', 'featured_work'.
      - [x] Add to frontend.
   - [x] Date selection for gallery show. 
         - Based on calendar set by admin.
         - Artist selects desired date ranges. 
         - Admin confirms dates.
         - Only shows available dates with not available dates grayed out.
   - [x] Gallery show approval process
         - Automatically marks show dates as unavailable when approved
         - Transaction ensures both show approval and date updates succeed together
         - Validates to prevent approval if dates are already taken
   - [x] Gallery show editing
         - Artists can edit show title and artworks after approval
         - Date changes restricted to pending shows only
         - UI components updated to reflect editing permissions
         - Database function and types updated for proper authorization

### Default Platform Follow Implementation
1. Database & Backend
   - [x] Create Meaning Machine AI profile with admin role
   - [x] Add migration for automatic follow relationship
   - [x] Implement trigger for new user registration to auto-follow MM AI
   - [x] Add RLS policies for system-managed follows

2. Frontend Integration
   - [x] Add visual indicator for MM AI content in feed
   - [x] Add proper error handling for feed loading

#### Patron Collection Integration
- [x] Reuse existing collection creation logic from `createPurchasedWorksCollection`
- [x] Reuse existing ghost profile claiming process from `claimGhostProfile`
- [x] Reuse existing transaction update logic for hybrid approach

#### Ghost Profile Handling
- [x] Reuse existing ghost profile creation/update functions from `lib/actions/ghost-profiles.ts`
- [x] Reuse existing ghost profile claiming process
- [x] Leverage existing ghost profile database schema and RLS policies

#### Transaction Validation
- [x] Reuse existing transaction schema and constraints
- [x] Leverage existing unique constraint on stripe_session_id
- [x] Use existing hybrid approach for transaction ownership tracking

## Deferred

### Default Platform Follow Implementation

3. Testing & Validation [deferred]
   - [ ] Add integration tests for auto-follow system
   - [ ] Verify proper follow relationship creation
   - [ ] Test edge cases (user deletion, role changes)