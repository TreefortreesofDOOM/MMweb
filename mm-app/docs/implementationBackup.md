# AI Gallery Assistant Application Architecture

## Status Legend
[✅] Complete
[🔄] In Progress
[⬜] Not Started
[🚫] Blocked
[🔍] Needs Review

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: 
  - React Server Components
  - shadcn/ui
  - Radix UI primitives (Dialog, Dropdown, Label, Progress, ScrollArea, Slider, Switch, Tabs, Toast)
- **Styling**: 
  - TailwindCSS
  - tailwindcss-animate
  - class-variance-authority
  - tailwind-merge
- **State Management**: React Context + Server Actions
- **Forms**: 
  - React Hook Form
  - Zod validation
  - @hookform/resolvers
- **File Handling**: react-dropzone
- **Notifications**: sonner
- **Theme**: next-themes
- **Icons**: lucide-react
- **Utilities**: clsx

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Hosting**: Vercel
- **APIs**: 
  - Google Cloud (Gemini Pro Vision) (@google/generative-ai)
  - Stripe Connect (@stripe/stripe-js)
  - Resend (Email)
- **File Processing**: Sharp
- **QR Code**: qrcode.react

### Development Tools
- **Package Manager**: npm
- **Formatting**: Prettier
- **Version Control**: Git
- **CI/CD**: Vercel (deployment)
- **Environment**: dotenv
- **Build Tools**: 
  - PostCSS
  - Autoprefixer
  - ts-node
- **Linting**: [⬜] ESLint (Not implemented)

## Analysis

### Current State Assessment
- [✅] Core infrastructure and authentication
- [🔄] Artist and artwork management features
- [🔄] Stripe integration for payments
- [⬜] AI features and integrations
- [⬜] Analytics and reporting

### Architecture Overview
1. **Frontend Architecture**
   - Next.js 13 App Router for routing and server components
   - React Server Components for improved performance
   - Client Components for interactive features
   - TailwindCSS with shadcn/ui for consistent UI
   - Progressive enhancement with JavaScript

2. **Backend Architecture**
   - Supabase for database and authentication
   - Serverless functions via Next.js API routes
   - Stripe Connect for payment processing
   - Google Cloud for AI services
   - Edge functions for performance

3. **Data Flow**
   - Server-side rendering for initial page loads
   - Client-side updates for dynamic content
   - WebSocket connections for real-time features
   - Optimistic updates for better UX
   - Background jobs for heavy processing

## Core Infrastructure

### Base Setup [✅]
- [x] Next.js 13 App Router setup
- [x] Supabase integration
- [x] TypeScript configuration
- [x] TailwindCSS setup
- [x] shadcn/ui components
- [x] Error boundary setup
- [x] Global state management
- [x] Toast notification system
- [x] Input validation library
- [x] Dark mode support
- [ ] CI/CD pipeline
- [ ] Production deployment
- [ ] Monitoring setup

### Performance Optimization [🔄]
- [x] Image optimization with Next.js Image
- [x] Code splitting with Next.js
- [x] Server-side rendering
- [x] Static page generation
- [x] Asset optimization
- [x] Resource hints
- [x] API response caching
- [x] Database query optimization
- [ ] Implement caching for embeddings
- [ ] Optimize vector searches
- [ ] Use streaming responses for AI
- [ ] Lazy load heavy components
- [ ] Monitor API usage
- [ ] Add infinite scroll
- [ ] Bundle size optimization

### Security Considerations [🔄]
- [x] Secure API keys in environment variables
- [x] Set up Supabase RLS policies
- [x] CSRF protection (Next.js built-in)
- [x] Security headers (Next.js built-in)
- [x] Input sanitization (Zod validation)
- [x] Output encoding
- [x] SQL injection prevention (Supabase)
- [x] XSS protection (React + Next.js)
- [x] Webhook signature verification
- [ ] Rate limiting implementation
- [ ] Audit logging
- [ ] Vulnerability scanning
- [ ] Penetration testing

### Monitoring & Analytics [⬜]
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] User analytics
- [ ] Server monitoring
- [ ] Database monitoring
- [ ] API monitoring
- [ ] Uptime monitoring
- [ ] Real-time alerts
- [ ] Custom dashboards
- [ ] Usage metrics
- [ ] Cost tracking
- [ ] Log aggregation
- [ ] Anomaly detection

### Database Schema [✅]
- [x] User profiles schema
- [x] Artwork metadata schema
- [x] Artist applications schema
- [x] Vector embeddings setup
- [x] Create profiles table
- [x] Add artworks table
- [x] Set up RLS policies
- [x] Implement migrations
- [x] Add indexes for performance
- [ ] Analytics tables
- [ ] Transaction history
- [ ] Payment processing tables

### Storage Implementation [✅]
- [x] Set up Supabase storage buckets
- [x] Configure storage policies
- [x] Implement file upload handlers
- [x] Add image optimization
- [x] Set up CDN caching

## Feature Implementations

### 1. Artist Management [✅]
#### Application Process
- [x] Create `/profile/application` route
- [x] Build application form component
- [x] Form validation and data collection
- [x] Portfolio URL validation
- [x] Artist statement requirements
- [x] Social media integration
- [x] Previous exhibitions tracking
- [x] Draft saving capability
- [x] Email notifications

#### Status Management
- [x] Draft state for incomplete applications
- [x] Pending state for submitted applications
- [x] Approved state for accepted artists
- [x] Rejected state with reason tracking
- [x] Email notifications for status changes
- [x] Automatic status synchronization
- [x] Role assignment on approval

### 2. Artwork Management [✅]
- [x] Artwork creation
- [x] Image upload with preview
- [x] Multiple image support
- [x] Primary image selection
- [x] Image reordering
- [x] Publishing workflow
- [x] Gallery view
- [x] Artwork detail modal
- [x] Artwork pricing
- [ ] Similar artworks suggestions
- [ ] Advanced search/filtering

### 3. AI Integration

#### AI Core Features [✅]
- [x] Image analysis with Google Gemini
- [x] Style detection
- [x] Technique analysis
- [x] Keyword generation
- [x] Description generation
- [x] Similar artwork matching
- [x] Price suggestions

#### AI Gallery Assistant [🔄]
- [x] Set up Google Cloud Project
- [x] Enable Multimodal Live API
- [x] Create WebSocket proxy server
- [x] Implement chat interface
- [x] Add session management
- [x] Set up real-time streaming
- [x] Implement rate limiting

#### AI Artist Assistant [🔄]
Features:
- [x] Portfolio management assistance
- [x] Artist statement generation
- [x] Bio writing
- [x] Marketing materials generation
- [ ] Press release creation
- [ ] Sales materials creation
- [x] Art description generation with image analysis

Required Access:
- [x] Artist portfolios and profiles
- [x] Art history and movements database
- [x] Art market analysis
- [x] Art techniques and mediums
- [ ] Curation and exhibition design
- [ ] Conservation and preservation
- [ ] Digital art and NFTs

#### AI Patron Assistant [🔄]
Features:
- [x] Art discovery assistance
- [x] Art education and understanding
- [x] Personalized recommendations
- [x] Purchase history analysis

Required Access:
- [x] Available artworks database
- [x] Artist profiles and portfolios
- [x] Art history and movements
- [x] Market analysis
- [x] User preferences and history

### 4. Stripe Integration [✅]

#### Initial Setup [✅]
- [x] Install required packages
- [x] Configure environment variables
- [x] Set up server-side Stripe client
- [x] Set up client-side Stripe loader
- [x] Set up webhook handling
- [x] Configure webhook signature verification

#### Core Implementation [✅]
- [x] Create payment intent endpoint
- [x] Implement fee calculations (50% platform fee)
- [x] Set up webhook handlers
- [x] Handle account updates
- [x] Create transaction records
- [x] Handle refund flow
- [x] Implement idempotency
- [x] Error handling and logging

#### Artist Onboarding [✅]
- [x] Create Stripe Connect Express accounts
- [x] Handle onboarding redirects
- [x] Process webhook updates
- [x] Update profile status
- [x] Add Stripe Express dashboard links
- [x] Handle account relinks
- [x] Manage account status

#### Sales Features [✅]
- [x] Implement purchase UI
- [x] Add price breakdown with fees
- [x] Create transaction tracking
- [x] QR code generation for gallery sales
- [x] Payment link generation
- [x] Transaction history
- [x] Payout tracking

## Development Guidelines

### Code Organization
- [x] Keep AI/ML utilities in `utils/ai/`
- [x] Payment logic in `utils/stripe/`
- [x] Database queries in `utils/supabase/`
- [x] Components in `components/`
- [x] API routes in `app/api/`

### Testing Strategy [⬜]
- [x] Create test user script
- [x] Test email functionality
- [x] AI test interface
- [ ] Install Jest and React Testing Library
- [ ] Write tests for components
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline
- [ ] Unit tests for utilities
- [ ] Integration tests for AI features
- [ ] E2E tests for payment flows
- [ ] Mock external APIs in tests
- [ ] Test vector similarity accuracy

### Deployment Strategy [🔄]
- [x] Set up Vercel project
- [x] Configure environment variables
- [x] Set up production database
- [ ] Add monitoring tools
- [ ] Configure backup systems
- [ ] Set up CI/CD pipeline
- [ ] Production deployment checklist
- [ ] Monitoring setup
- [ ] Staging environment configuration
- [ ] Load balancing setup
- [ ] CDN configuration
- [ ] Disaster recovery plan

### Documentation
- [x] README.md with setup instructions
- [x] Component documentation (shadcn)
- [x] Directory structure documentation
- [x] Environment variables documentation
- [x] Tech stack documentation
- [x] Development workflow guidelines
- [x] Git commit guidelines
- [ ] API documentation
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] Security guidelines

### Directory Structure
```
MM-web/
mm-app/
├── app/
│   ├── (auth-pages)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── reset-password/
│   ├── actions/
│   │   └── upload.ts
│   ├── admin/
│   │   └── applications/
│   ├── api/
│   │   ├── artworks/
│   │   │   ├── create/
│   │   │   └── upload/
│   │   └── webhooks/
│   │       └── stripe/
│   ├── artist/
│   │   └── artworks/
│   │       ├── new/
│   │       ├── artworks-client.tsx
│   │       └── page.tsx
│   ├── artist-application/
│   ├── auth/
│   │   └── callback/
│   ├── profile/
│   │   └── edit/
│   ├── protected/
│   ├── actions.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── artwork/
│   │   ├── artwork-card.tsx
│   │   ├── artwork-form.tsx
│   │   └── artwork-upload.tsx
│   ├── auth/
│   │   └── auth-form.tsx
│   ├── ui/
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── use-toast.tsx
│   └── submit-button.tsx
├── docs/
│   └── implementation.md
├── lib/
│   ├── ai/
│   │   └── gemini.ts
│   ├── stripe/
│   │   └── stripe-server.ts
│   └── utils.ts
├── public/
│   └── images/
│       ├── favicons/
│       └── logos/
├── scripts/
│   └── create-test-users.ts
├── supabase/
│   ├── migrations/
│   │   └── [migrations]
│   └── config.toml
├── utils/
│   ├── supabase/
│   │   ├── action.ts
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   └── utils.ts
├── .env.local
├── middleware.ts
├── next.config.js
├── package.json
└── [config files]