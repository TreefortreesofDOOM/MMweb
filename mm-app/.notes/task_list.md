# Task List

## High Priority

- [ ] Instead of Collection Age, on collection page in the collection data detail, show time since last transaction. We want to subtly encourage them to add more art to their collection. Rekindle their art buying habits.

- [ ] Add proper date editing for gallery shows:
   - [ ] Create database function `update_gallery_show_dates` to handle date updates in a transaction
   - [ ] Update old dates to be available again in gallery_dates table
   - [ ] Set new dates as unavailable in gallery_dates table
   - [ ] Add validation to prevent conflicts with other shows' dates
   - [ ] Update the updateGalleryShow action to use the new function for approved shows

## Stripe
- [ ] Review our Stripe implementation and discuss how we can implement a system that adds products to the platform Stripe account from verified users. Both the admin and the user need to be able to do this. 
- [ ] After a user classifies their work and the flags are set, we are then ready to add products to the platform Stripe account with the users connected account included for payouts. 
   -  Collectors_wall are fixed price, 
   -  added_value_pedestal are fixed price, 
   -  featured_work are fixed price,
   -  Trust_wall are choose-your-own-price with a minimum value set by the user and confirmed by the admin between $10 - $50. Please review the stripe documentation for more details since we are using Stripe Connect and i don't think we can use stripe connect for customer selected choose-your-own-price type products.  

### Recommendation Engine
- There is no way to browse or follow collectors. We should think about how to implement this.

   **Basic Details**
   - We should recommend patrons to artists they might like based on an analysis of their collection and artist's content.
   - We should also recommend artists to patrons they might like based on an analysis of their collection and artist's content.
   - We should also recommend patrons to each other based on an analysis of their collection and each other's content.

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

### Patron Collection View Improvements
1. DRY Improvements
   - [ ] Create shared utilities for common collection operations
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

### Default Platform Follow Implementation
1. Database & Backend
   - [x] Create Meaning Machine AI profile with admin role
   - [x] Add migration for automatic follow relationship
   - [x] Implement trigger for new user registration to auto-follow MM AI
   - [x] Add RLS policies for system-managed follows

2. Frontend Integration
   - [x] Add visual indicator for MM AI content in feed
   - [x] Add proper error handling for feed loading

## Deferred

### Default Platform Follow Implementation

3. Testing & Validation [deferred]
   - [ ] Add integration tests for auto-follow system
   - [ ] Verify proper follow relationship creation
   - [ ] Test edge cases (user deletion, role changes)