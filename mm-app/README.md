# Meaning Machine Web Platform

A modern art gallery platform built with Next.js 14, Supabase, and TailwindCSS.

## Core Features ✅

### Authentication & Authorization
- [x] Email-based authentication with Supabase
- [x] Role-based access control (Admin, Artist, Collector)
- [x] Protected routes and API endpoints
- [x] Email verification system
- [x] Password reset flow

### Artist Features
- [x] Two-tier system (Emerging/Verified Artists)
- [x] Portfolio management
- [x] Artwork upload and management
- [x] AI-powered artwork analysis
- [x] Stripe Connect integration
- [x] Featured artist system
- [x] Exhibition tools
- [x] QR code generation

### Admin Dashboard
- [x] Artist application review
- [x] User management
- [x] Platform statistics
- [x] Content moderation
- [x] Featured artist management
- [x] Exhibition management

### Core Platform
- [x] Next.js 14 App Router
- [x] Supabase integration
- [x] TailwindCSS with shadcn/ui
- [x] Dark mode support
- [x] Toast notifications
- [x] Loading states
- [x] Error handling
- [x] Responsive design

## In Development 🚧

### High Priority
- [⚠️] Multi-image upload system
- [⚠️] Artist directory filtering
- [⚠️] Profile verification dashboard
- [⚠️] Advanced analytics system

### Medium Priority
- [ ] Community features
- [ ] Exhibition space management
- [ ] Physical gallery integration
- [ ] Enhanced social features

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui components
- React Server Components

### Backend
- Supabase (Database & Auth)
- Stripe Connect
- Google Gemini AI
- Resend Email

### Infrastructure
- Vercel deployment
- Image optimization
- Rate limiting
- Error tracking (Sentry)

## Project Structure

```
mm-app/
├── app/                    # Next.js 14 App Router
│   ├── (protected)/       # Protected routes
│   ├── (public)/         # Public routes
│   ├── (auth)/           # Auth pages
│   ├── (admin)/         # Admin routes
│   ├── api/             # API endpoints
│   ├── profile/         # Profile pages
│   └── gallery/         # Gallery pages
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── nav/            # Navigation
│   ├── artwork/        # Artwork features
│   ├── verification/   # Verification system
│   ├── analytics/      # Analytics components
│   ├── validation/     # Form validation
│   ├── providers/      # Context providers
│   ├── role/           # Role-based components
│   ├── ai/             # AI feature components
│   └── typography/     # Text components
├── lib/
│   ├── actions/        # Server actions
│   ├── supabase/       # Database utilities
│   ├── stripe/         # Payment integration
│   └── ai/             # AI features
├── context/            # React context
├── hooks/              # Custom React hooks
├── migrations/         # Database migrations
├── scripts/           # Utility scripts
├── supabase/          # Supabase configuration
└── styles/            # Global styles
```

## Getting Started

1. **Clone & Install**
   ```bash
   git clone [repository-url]
   cd mm-app
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   RESEND_API_KEY=your_resend_api_key
   GOOGLE_AI_API_KEY=your_gemini_api_key
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```

## Development Guidelines

### Code Standards
- Use TypeScript for all new files
- Follow existing component structure
- Use Tailwind for styling
- Implement proper error handling
- Add loading states
- Ensure responsive design
- Follow accessibility guidelines

### UX Guidelines
- Progressive disclosure
- Clear feedback
- Consistent spacing
- Mobile-first approach
- Performance optimization
- Accessibility compliance

### Best Practices
- Early returns in functions
- Proper error boundaries
- Loading state handling
- Type safety
- Component documentation
- Accessibility features

## Documentation
- [Master Roadmap](./docs/masterRoadmap.md)
- [UX Guidelines](./docs/ui/uxTodo2.md)
- [Implementation Details](./docs/implementation/)

## Contributing
1. Create feature branch
2. Follow guidelines
3. Submit pull request

## License
[License Type] - See LICENSE file for details
