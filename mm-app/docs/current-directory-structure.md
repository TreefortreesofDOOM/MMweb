# Complete Directory Structure (as of March 2024)

```
mm-app/
├── .google/
├── .next/
├── app/
│   ├── (admin)/
│   │   ├── admin-dashboard/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── applications/
│   │   │   └── page.tsx
│   │   ├── featured-artist/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (auth)/
│   │   ├── callback/
│   │   ├── email/
│   │   ├── forgot-password/
│   │   ├── onboarding/
│   │   ├── reset-password/
│   │   ├── role-selection/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── layout.tsx
│   ├── (protected)/
│   │   ├── artist/
│   │   ├── profile/
│   │   │   ├── application/
│   │   │   ├── edit/
│   │   │   ├── validation/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (public)/
│   │   ├── artists/
│   │   ├── artwork/
│   │   ├── gallery/
│   │   ├── vertex-test/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── ai/
│   │   ├── gallery/
│   │   ├── registration/
│   │   ├── stripe/
│   │   ├── test/
│   │   ├── test-email/
│   │   ├── verification/
│   │   ├── vertex-ai/
│   │   └── webhooks/
│   ├── layout.tsx
│   ├── globals.css
│   └── favicon.ico
├── components/
│   ├── admin/
│   │   ├── application-list.tsx
│   │   ├── application-review.tsx
│   │   └── featured-artist-manager.tsx
│   ├── ai/
│   │   ├── ai-artist-search.tsx
│   │   ├── artist-assistant.tsx
│   │   ├── chat-interface.tsx
│   │   ├── gallery-assistant.tsx
│   │   ├── patron-assistant.tsx
│   │   └── test-chat.tsx
│   ├── analytics/
│   │   ├── ai-chat.tsx
│   │   ├── dashboard.tsx
│   │   └── page-view-tracker.tsx
│   ├── artist/
│   │   ├── artist-profile-card.tsx
│   │   ├── feature-coming-soon.tsx
│   │   ├── featured-artist.tsx
│   │   └── stripe-onboarding.tsx
│   ├── artwork/
│   │   ├── sortable-image-grid/
│   │   ├── artwork-ai-analysis.tsx
│   │   ├── artwork-card.tsx
│   │   ├── artwork-form.tsx
│   │   ├── artwork-gallery.tsx
│   │   ├── artwork-grid.tsx
│   │   ├── artwork-modal.tsx
│   │   ├── artwork-qr.tsx
│   │   ├── artwork-upload.tsx
│   │   ├── sortable-artwork-card.tsx
│   │   └── sortable-artwork-grid.tsx
│   ├── auth/
│   │   ├── auth-form.tsx
│   │   ├── signup-form.tsx
│   │   └── terms-modal.tsx
│   ├── layout/
│   │   ├── admin-layout.tsx
│   │   ├── artist-layout.tsx
│   │   └── sidebar-nav.tsx
│   ├── nav/
│   │   ├── main-nav.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── role-nav.tsx
│   │   ├── side-nav.tsx
│   │   ├── site-header.tsx
│   │   ├── logo.tsx
│   │   ├── theme-switcher.tsx
│   │   └── user-nav.tsx
│   ├── portfolio/
│   │   ├── portfolio-filters.tsx
│   │   └── portfolio-sort.tsx
│   ├── profile/
│   │   ├── medium-input.tsx
│   │   ├── profile-avatar-form.tsx
│   │   ├── profile-medium-form.tsx
│   │   ├── qr-error-boundary.tsx
│   │   └── user-qr.tsx
│   ├── providers/
│   │   └── artist-provider.tsx
│   ├── role/
│   │   └── role-selection-wizard.tsx
│   ├── social/
│   │   ├── favorite-button.tsx
│   │   ├── follow-button.tsx
│   │   └── index.ts
│   ├── typography/
│   │   └── inline-code.tsx
│   ├── ui/
│   │   ├── accordion.tsx
│   │   ├── alert.tsx
│   │   ├── artist-badge.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── copy-button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── exhibition-badge.tsx
│   │   ├── feature-gate.tsx
│   │   ├── form-message.tsx
│   │   ├── hero.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── spinner.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   ├── tooltip.tsx
│   │   └── use-toast.tsx
│   ├── validation/
│   │   └── validation-tracker.tsx
│   └── verification/
│       ├── requirements-list.tsx
│       └── verification-banner.tsx
├── context/
│   └── auth-context.tsx
├── docs/
├── hooks/
│   ├── use-ai-chat.ts
│   ├── use-analytics.ts
│   ├── use-artist.ts
│   ├── use-auth.ts
│   ├── use-debounce.ts
│   ├── use-feature-access.ts
│   ├── use-navigation.ts
│   ├── use-toast.ts
│   ├── use-user.ts
│   └── use-verification.ts
├── lib/
│   ├── actions/
│   │   ├── admin.ts
│   │   ├── ai-search.ts
│   │   ├── ai.ts
│   │   ├── analytics.ts
│   │   ├── artist.ts
│   │   ├── artwork.ts
│   │   ├── auth.ts
│   │   ├── featured-artist.ts
│   │   ├── helpers.ts
│   │   ├── index.ts
│   │   ├── profile.ts
│   │   ├── registration.ts
│   │   ├── role.ts
│   │   ├── social.ts
│   │   ├── update-avatar.ts
│   │   └── verification.ts
│   ├── ai/
│   │   ├── embeddings.ts
│   │   ├── gemini.ts
│   │   ├── instructions.ts
│   │   ├── personalities.ts
│   │   ├── prompts.ts
│   │   └── types.ts
│   ├── analytics/
│   │   ├── analytics.ts
│   │   └── track.ts
│   ├── auth/
│   │   └── utils.ts
│   ├── constants/
│   │   └── mediums.ts
│   ├── emails/
│   │   └── artist-notifications.ts
│   ├── navigation/
│   │   ├── config.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── stripe/
│   │   ├── stripe-client.ts
│   │   ├── stripe-products.ts
│   │   └── stripe-server.ts
│   ├── supabase/
│   │   ├── action.ts
│   │   ├── check-env-vars.ts
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   ├── server.ts
│   │   └── service-role.ts
│   ├── types/
│   │   ├── database.types.ts
│   │   └── custom-types.ts
│   ├── utils/
│   │   ├── search.ts
│   │   └── utils.ts
│   ├── vertex-ai/
│   │   ├── bigquery-setup.ts
│   │   ├── client.ts
│   │   ├── extract-data.ts
│   │   ├── format.ts
│   │   ├── test-extraction.ts
│   │   └── types.ts
│   └── env.ts
├── migrations/
├── node_modules/
├── public/
│   └── images/
├── scripts/
├── supabase/
│   ├── .branches/
│   ├── .temp/
│   ├── migrations/
│   ├── seed/
│   ├── .gitignore
│   └── config.toml
├── .cursorrules
├── .env
├── .env.local
├── .gitignore
├── components.json
├── config-overrides.js
├── middleware.ts
├── next-env.d.ts
├── next.config.js
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## Notable Differences from Spec

1. **App Directory Structure:**
   - Uses Next.js 13+ app router conventions with route groups (parentheses folders)
   - Route groups are well-organized:
     - `(admin)`: Protected admin routes with dedicated layout
     - `(auth)`: Complete authentication flow
     - `(protected)`: Protected routes requiring authentication
     - `(public)`: Public-facing pages
   - Missing some specified directories like `artist-application/`
   - Has additional directories not in spec like `vertex-test/`

2. **Components Directory Structure:**
   - More granular organization than spec with additional directories
   - Comprehensive `ui/` directory with shadcn components
   - Feature-specific directories:
     - `admin/`: Admin-specific components (application review, featured artist management)
     - `ai/`: AI-related components (chat interfaces, assistants)
     - `analytics/`: Analytics and tracking components
     - `artist/`: Artist-specific components (profile, featured artist)
     - `artwork/`: Artwork management and display
     - `auth/`: Authentication forms and submit button
     - `layout/`: Layout components
     - `nav/`: Navigation components (main nav, logo, theme switcher)
     - `portfolio/`: Portfolio management
     - `profile/`: Profile management (avatar upload, forms)
     - `providers/`: Context providers
     - `role/`: Role selection
     - `social/`: Social features
     - `typography/`: Typography components
     - `ui/`: Shared UI components (form message, hero)
     - `validation/`: Validation components
     - `verification/`: Verification components and banner
   - All components properly organized into feature-specific directories
   - No loose components at root level

3. **Lib Directory Structure:**
   - Contains most of the application's core logic and utilities
   - Has its own `utils/` directory (not at root level as specified)
   - Contains multiple feature-specific directories:
     - `actions/`: Server actions
     - `ai/`, `analytics/`: Feature-specific logic
     - `auth/`: Authentication utilities
     - `stripe/`: Payment integration
     - `supabase/`: Database utilities
     - `vertex-ai/`: AI integration
   - Contains type definitions and database types
   - Has some potential duplication with root directories (hooks, analytics)

4. **Additional Top-Level Directories:**
   - `hooks/`: Custom React hooks (some duplication with lib/hooks)
   - `context/`: React context providers (single auth context)
   - `.google/`: Google Cloud/API related configurations
   - `migrations/` (should be under supabase/)

5. **Supabase Structure:**
   - Has proper migrations directory
   - Includes seed data
   - Contains configuration
   - Has temporary and branch directories

6. **Additional Configuration Files:**
   - `components.json`: Shadcn UI configuration
   - `config-overrides.js`
   - `next.config.ts` (duplicate with next.config.js)
   - `postcss.config.js`: PostCSS configuration for Tailwind
   - `tailwind.config.ts`: Tailwind configuration

7. **Component Organization Details:**
   - `admin/`: Admin-specific components for application review and artist management
   - `ai/`: AI-related components including chat interfaces and assistants for different user types
   - `analytics/`: Analytics and tracking components including dashboard
   - `artist/`: Artist-specific components including profile and onboarding

8. **Component Organization Issues:**
   - AI-related functionality split between `ai/` components and `lib/ai/`
   - Analytics split between components, lib, and hooks
   - Admin functionality spread across multiple directories (components, pages, actions)
   - Artist-related components split between `artist/`, `artwork/`, and `portfolio/`
   - Validation components split between components and lib
   - Empty validation directory in lib
   - Multiple utility files and directories

9. **Library Organization Details:**
   - `ai/`: Comprehensive AI implementation with embeddings, prompts, and types
   - `analytics/`: Simple tracking implementation
   - `auth/`: Minimal auth utilities
   - `constants/`: Application constants (currently only mediums)
   - `emails/`: Email notification templates
   - `navigation/`: Navigation configuration and utilities
   - `stripe/`: Payment integration with client/server separation
   - `supabase/`: Database client implementations
   - `vertex-ai/`: Google Vertex AI integration with BigQuery

10. **Library Organization Updates:**
    - All hooks consolidated in root `/hooks` directory
    - Removed duplicate hooks from `lib/hooks`
    - Hooks now properly imported from root `/hooks` directory
    - Consistent hook organization and naming
    - Clear separation between hooks and other utilities

11. **Admin Route Organization:**
    - Consolidated into single admin area:
      - `(admin)/`: Protected admin routes with layout
        - `admin-dashboard/`: Main admin interface
        - `analytics/`: Combined analytics dashboard and AI chat
        - `applications/`: Application management
        - `featured-artist/`: Curator tools
    - Removed:
      - Legacy `admin/` directory
      - Empty `(admin)/verification/` directory
      - Empty `(protected)/admin/featured-artist/` directory

12. **Admin Feature Distribution:**
    - Routes consolidated in `app/(admin)/`
    - Components: `components/admin/`
      - `application-list.tsx`
      - `application-review.tsx`
      - `featured-artist-manager.tsx`
    - Actions: `lib/actions/admin.ts`
    - Analytics: Consolidated in:
      - `(admin)/analytics/page.tsx`
      - `components/analytics/`
      - `lib/analytics/`
    - Verification:
      - Components in `components/verification/`
      - Actions in `lib/actions/verification.ts`

13. **Route Organization Status:**
    - ✅ Profile validation route consolidated:
      - Moved to `app/(protected)/profile/validation/`
      - Properly protected with authentication
      - Grouped with other profile features
      - Maintains all functionality

    - ⏳ Gallery visit feature deferred:
      - Code moved to `reference/gallery-visit/` for future implementation
      - Feature is in research phase (see masterRoadmap.md)
      - Will be implemented as protected route when ready
      - Physical gallery check-in system pending design

    - Current structure:
      - Protected routes under `(protected)/`:
        - Profile management
        - Validation tracking
        - Artist features
      - Public routes under `(public)/`:
        - Gallery listing
        - Artist directory
        - Public pages

    Benefits achieved:
    - ✅ Consistent route organization
    - ✅ Clear access control through route groups
    - ✅ Better maintainability
    - ✅ Follows Next.js app router conventions
    - ✅ Improved feature cohesion
    - ✅ Clearer authentication boundaries
    - ✅ Simplified navigation structure

[UPDATED - March 2024]
13. **Route Organization Status:**

This document serves as a complete snapshot of the current directory structure for comparison with the specification in `.cursorrules`. 

## Library Directory Details

1. **Server Actions (`actions/`):**
   - Admin functionality (`admin.ts`, `featured-artist.ts`)
   - Authentication (`auth.ts`, `registration.ts`)
   - User management (`profile.ts`, `role.ts`, `social.ts`)
   - Content management (`artwork.ts`, `artist.ts`)
   - AI/Analytics (`ai.ts`, `ai-search.ts`, `analytics.ts`)
   - Verification (`verification.ts`)
   - Utility actions (`helpers.ts`, `update-avatar.ts`)

2. **AI Implementation (`ai/`):**
   - Core AI functionality (`gemini.ts`, `embeddings.ts`)
   - Configuration (`instructions.ts`, `prompts.ts`, `personalities.ts`)
   - Type definitions (`types.ts`)

3. **Analytics (`analytics/`):**
   - Event tracking (`track.ts`)
   - Root analytics file needs consolidation

4. **Authentication (`auth/`):**
   - Authentication utilities (`utils.ts`)
   - Minimal implementation, could be expanded

5. **Stripe Integration (`stripe/`):**
   - Client/server separation (`stripe-client.ts`, `stripe-server.ts`)
   - Product management (`stripe-products.ts`)

6. **Vertex AI (`vertex-ai/`):**
   - Core functionality (`client.ts`, `extract-data.ts`, `format.ts`)
   - BigQuery integration (`bigquery-setup.ts`)
   - Testing utilities (`test-extraction.ts`)
   - Type definitions (`types.ts`)

7. **Utilities and Types:**
   - Database types (`database.types.ts`)
   - Environment variables (`env.ts`)
   - Search functionality (`utils/search.ts`)
   - General utilities (`utils/utils.ts`, root `utils.ts`)

## Areas for Improvement

1. **Consolidation Needed:**
   - ✅ Utils consolidated in `utils/` directory
   - ✅ Analytics consolidated in `analytics/` directory
   - ✅ Database types consolidated in `types/` directory

2. **Directory Cleanup:**
   - ✅ Empty validation directory removed
   - ✅ Analytics directory properly organized
   - Thin auth directory

3. **Type Organization:**
   - ✅ Types consolidated into `types/` directory
   - ✅ Database types backup removed
   - ✅ Type files properly organized

4. **Utility Organization:**
   - ✅ Root utils moved into `utils/` directory
   - Consider breaking down large utility files
   - Standardize utility file naming

5. **Action Organization:**
   - Consider grouping related actions
   - Split large action files (e.g., `artwork.ts`)
   - Add index exports for better importing

## Utility File Naming Standardization

✅ All utility files have been renamed following the conventions:

1. **In `/lib/utils/`:**
   - ✅ `utils.ts` → `common-utils.ts`
   - ✅ `search.ts` → `search-utils.ts`

2. **In `/lib/auth/`:**
   - ✅ `utils.ts` → `auth-utils.ts`

3. **In `/lib/navigation/`:**
   - ✅ `utils.ts` → `navigation-utils.ts`

4. **In `/lib/vertex-ai/`:**
   - ✅ `format.ts` → `format-utils.ts`
   - ✅ `client.ts` → `vertex-client.ts`
   - ✅ `extract-data.ts` → `data-extraction-utils.ts`

5. **In `/lib/stripe/`:**
   - ✅ `stripe-client.ts` → `stripe-client-utils.ts`
   - ✅ `stripe-server.ts` → `stripe-server-utils.ts`

6. **In `/lib/supabase/`:**
   - ✅ `client.ts` → `supabase-client.ts`
   - ✅ `server.ts` → `supabase-server.ts`
   - ✅ `action.ts` → `supabase-action-utils.ts`

Naming Convention Rules:
1. Use kebab-case for all file names
2. Add `-utils` suffix for utility files
3. Add domain prefix for domain-specific utilities
4. Use descriptive names that indicate functionality
5. Group related utilities in appropriately named files

Benefits:
- Clearer file purpose and contents
- Easier to find related utilities
- Consistent naming across the codebase
- Better code organization
- Improved maintainability

Implementation Plan:
1. Rename files in batches by directory
2. Update all imports in related files
3. Test after each batch of changes
4. Update documentation to reflect new names