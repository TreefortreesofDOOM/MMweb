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
│   │   │   └── route.ts
│   │   ├── email/
│   │   │   └── smtp-message.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── onboarding/
│   │   │   ├── complete/
│   │   │   │   └── page.tsx
│   │   │   ├── refresh/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   ├── role-selection/
│   │   │   └── page.tsx
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   ├── sign-up/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (protected)/
│   │   ├── artist/
│   │   │   ├── analytics/
│   │   │   ├── artworks/
│   │   │   ├── dashboard/
│   │   │   ├── portfolio/
│   │   │   ├── qr-code/
│   │   │   └── verification/
│   │   ├── profile/
│   │   │   ├── application/
│   │   │   │   ├── page.tsx
│   │   │   ├── edit/
│   │   │   │   └── page.tsx
│   │   │   └── validation/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (public)/
│   │   ├── artists/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── artist-card.tsx
│   │   │   ├── artists-client.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── artwork/
│   │   │   └── [id]/
│   │   │   │   └── page.tsx
│   │   ├── gallery/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── ai/
│   │   │   ├── analytics/
│   │   │   │   └── route.ts
│   │   │   ├── analyze-artwork/
│   │   │   │   └── route.ts
│   │   │   ├── assistant/
│   │   │   │   └── route.ts
│   │   │   ├── chat/
│   │   │   │   └── route.ts
│   │   │   └── extract-bio/
│   │   │   │   └── route.ts
│   │   ├── artworks/
│   │   │   └── [id]/
│   │   ├── gallery/
│   │   │   └── visit/
│   │   │   │   └── [userId]/
│   │   │   │   └── route.ts
│   │   ├── stripe/
│   │   │   ├── connect/
│   │   │   │   └── route.ts
│   │   │   ├── login-link/
│   │   │   │   └── route.ts
│   │   │   └── payment-link/
│   │   │   │   └── route.ts
│   │   ├── test-email/
│   │   │   └── route.ts
│   │   ├── verification/
│   │   │   └── refresh/
│   │   ├── vertex-ai/
│   │   │   ├── search/
│   │   │   │   └── route.ts
│   │   │   ├── setup/
│   │   │   │   └── route.ts
│   │   │   ├── setup-bigquery/
│   │   │   │   └── route.ts
│   │   │   ├── test/
│   │   │   │   └── route.ts
│   │   │   └── test-setup/
│   │   │   │   └── route.ts
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── favicon.ico
├── components/
│   ├── admin/
│   ├── ai/
│   ├── analytics/
│   ├── artist/
│   ├── artwork/
│   ├── auth/
│   ├── layout/
│   ├── nav/
│   ├── portfolio/
│   ├── profile/
│   ├── providers/
│   ├── role/
│   ├── social/
│   ├── typography/
│   ├── ui/
│   ├── unified-ai/
│   ├── validation/
│   └── verification/
├── lib/
│   ├── actions/
│   ├── ai/
│   ├── analytics/
│   ├── auth/
│   ├── constants/
│   ├── emails/
│   ├── navigation/
│   ├── services/
│   ├── stripe/
│   ├── supabase/
│   ├── types/
│   ├── unified-ai/
│   ├── utils/
│   ├── vertex-ai/
│   ├── utils.ts
│   └── env.ts
├── types/
├── hooks/
├── context/
├── public/
├── reference/
├── scripts/
├── supabase/
├── .google/
├── .next/
├── .cursorrules
├── .env
├── .env.local
├── .gitignore
├── components.json
├── middleware.ts
├── next-env.d.ts
├── next.config.js
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
- `unified-ai/` - Unified AI component system
- `ui/` - Shared UI components
- `typography/` - Typography-specific components
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
- `types/` - Global TypeScript types and interfaces
- `hooks/` - Custom React hooks
- `context/` - React contexts
- `public/` - Static assets
- `supabase/` - Database migrations and config
- `reference/` - Reference documentation and examples
- `.google/` - Google Cloud configuration

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

### Added
- `unified-ai/` components directory
- `.google/` configuration directory
- `reference/` documentation directory
- Root level `types/` directory

### Consolidated
- All global types in `/types`
- AI components in `unified-ai`
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
- `.google/` - Google Cloud settings

### Environment
- `.env` - Base variables
- `.env.local` - Local overrides
- `.cursorrules` - Project standards

## Best Practices

1. **Component Organization**
   - Group by feature
   - Maintain clear boundaries
   - Follow naming conventions
   - Use unified AI components where applicable

2. **Route Structure**
   - Use route groups
   - Protect sensitive routes
   - Maintain layouts

3. **Code Organization**
   - Business logic in actions
   - Utils in proper directories
   - Types centralized in `/types`
   - Clear separation of concerns
   - AI functionality in unified system