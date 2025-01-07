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