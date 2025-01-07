# Task List

## High Priority

- [ ] Instead of Collection Age, on collection page in the collection data detail, show time since last transaction. We want to subtly encourage them to add more art to their collection. Rekindle their art buying habits.

### Default Platform Follow Implementation
1. Database & Backend
   - [x] Create Meaning Machine AI profile with admin role
   - [x] Add migration for automatic follow relationship
   - [x] Implement trigger for new user registration to auto-follow MM AI
   - [x] Add RLS policies for system-managed follows

2. Frontend Integration
   - [x] Add visual indicator for MM AI content in feed
   - [x] Add proper error handling for feed loading

3. Testing & Validation
   - [ ] Add integration tests for auto-follow system
   - [ ] Verify proper follow relationship creation
   - [ ] Test edge cases (user deletion, role changes)

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

## Completed
