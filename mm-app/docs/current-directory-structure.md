# Project Directory Structure (March 2024)

## Overview

This document outlines the current directory structure and organization standards for the MM Web application. The project follows Next.js 13+ App Router conventions and modern React best practices.

## Complete Directory Tree
```
mm-app/
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
│   │   └── auth-utils.ts
│   ├── constants/
│   │   └── mediums.ts
│   ├── emails/
│   │   └── artist-notifications.ts
│   ├── navigation/
│   │   ├── config.ts
│   │   ├── types.ts
│   │   └── navigation-utils.ts
│   ├── stripe/
│   │   ├── stripe-client-utils.ts
│   │   ├── stripe-products.ts
│   │   └── stripe-server-utils.ts
│   ├── supabase/
│   │   ├── supabase-action-utils.ts
│   │   ├── check-env-vars.ts
│   │   ├── supabase-client.ts
│   │   ├── middleware.ts
│   │   ├── supabase-server.ts
│   │   └── service-role.ts
│   ├── types/
│   │   ├── database.types.ts
│   │   └── custom-types.ts
│   ├── utils/
│   │   ├── search-utils.ts
│   │   └── common-utils.ts
│   ├── vertex-ai/
│   │   ├── bigquery-setup.ts
│   │   ├── vertex-client.ts
│   │   ├── data-extraction-utils.ts
│   │   ├── format-utils.ts
│   │   ├── test-extraction.ts
│   │   └── types.ts
│   └── env.ts
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
├── middleware.ts
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## Core Directories

### `app/` - Next.js App Router
- `(admin)/` - Protected admin routes and dashboard
- `(auth)/` - Authentication flow and user onboarding
- `(protected)/` - Protected user features and profile
- `(public)/` - Public pages and gallery
- `api/` - API routes and endpoints

### `components/` - React Components
- Feature-specific directories (admin, ai, artist, etc.)
- Shared UI components in `ui/`
- No loose components at root level
- Follows consistent naming patterns

### `lib/` - Core Business Logic
- `actions/` - Server actions for all features
- `ai/` - AI implementation (Gemini, embeddings)
- `analytics/` - Tracking and reporting
- `auth/` - Authentication utilities
- `stripe/` - Payment integration
- `supabase/` - Database client
- `utils/` - Common utilities
- `vertex-ai/` - AI integration

### Supporting Directories
- `hooks/` - Custom React hooks
- `context/` - React contexts
- `public/` - Static assets
- `supabase/` - Database migrations and config

## File Naming Standards

### Utility Files
- Use kebab-case with `-utils` suffix
- Examples:
  - `common-utils.ts`
  - `search-utils.ts`
  - `auth-utils.ts`
  - `navigation-utils.ts`

### Domain-Specific Files
- Add domain prefix for clarity
- Examples:
  - `stripe-client-utils.ts`
  - `stripe-server-utils.ts`
  - `supabase-client.ts`
  - `vertex-client.ts`

### Component Files
- Use kebab-case for file names
- Examples:
  - `artwork-card.tsx`
  - `profile-avatar-form.tsx`
  - `featured-artist-manager.tsx`
  - `auth-form.tsx`
- Group by feature
- Include type definitions
- Export PascalCase component names

## Recent Updates ✅

### Removed
- Root `/migrations/` directory (consolidated in supabase)
- `next.config.ts` (duplicate config)
- `config-overrides.js` (unused)

### Consolidated
- All hooks in `/hooks`
- Types in `/types`
- Utils in feature directories
- Analytics in proper directories

### Standardized
- Utility file naming
- Component organization
- Route structure
- Configuration files

## Configuration

### Core Config Files
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript settings
- `tailwind.config.ts` - Styling
- `components.json` - UI components

### Environment
- `.env` - Base variables
- `.env.local` - Local overrides
- `.cursorrules` - Project standards

## Best Practices

1. **Component Organization**
   - Group by feature
   - Maintain clear boundaries
   - Follow naming conventions

2. **Route Structure**
   - Use route groups
   - Protect sensitive routes
   - Maintain layouts

3. **Code Organization**
   - Business logic in actions
   - Utils in proper directories
   - Types centralized
   - Clear separation of concerns