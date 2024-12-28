# Meaning Machine Web Platform

A modern art gallery platform built with Next.js 13, Supabase, and TailwindCSS.

## Features

- **Authentication & Authorization**
  - Email-based authentication with Supabase
  - Role-based access control (Admin, Artist, User)
  - Protected routes and API endpoints

- **Artist Features**
  - Artist application process
  - Portfolio management
  - Artwork upload and management
  - AI-powered artwork analysis
  - Stripe Connect integration for payments
  - Featured artist system with admin controls

- **Admin Dashboard**
  - Artist application review
  - User management
  - Platform statistics
  - Content moderation
  - Featured artist management
  - Homepage curation tools

- **Modern Tech Stack**
  - Next.js 13 with App Router
  - Supabase for backend and auth
  - TailwindCSS for styling
  - shadcn/ui components
  - TypeScript for type safety
  - Stripe for payments
  - Google Gemini for AI analysis

## Project Structure

```
mm-app/
├── app/                  # Next.js 13 App Router pages
│   ├── (auth-pages)/    # Authentication pages
│   ├── (admin)/         # Admin dashboard & features
│   ├── artist/          # Artist features
│   └── profile/         # User profile management
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── nav/            # Navigation components
│   ├── artwork/        # Artwork-related components
│   ├── admin/          # Admin-specific components
│   └── layout/         # Layout components
├── lib/                # Core utilities
│   ├── actions/        # Server actions
│   ├── supabase/       # Supabase client utilities
│   ├── stripe/         # Stripe integration
│   └── emails/         # Email templates
└── hooks/              # Custom React hooks
```

## Components

### Layout Components
- `layout/sidebar-nav.tsx` - Shared sidebar/drawer navigation
- `layout/admin-layout.tsx` - Admin dashboard layout
- `layout/artist-layout.tsx` - Artist dashboard layout

### Artwork Components
- `artwork/artwork-card.tsx` - Artwork display card
- `artwork/artwork-form.tsx` - Form for artwork creation/editing
- `artwork/artwork-modal.tsx` - Artwork detail modal
- `artwork/artwork-upload.tsx` - Image upload component
- `artwork/artwork-ai-analysis.tsx` - AI analysis component
- `artwork/artwork-qr.tsx` - QR code generator for in-gallery purchases

### Authentication Components
- `auth/auth-form.tsx` - Base form component for auth pages
- `header-auth.tsx` - Authentication header with sign-in/up buttons

### UI Components (shadcn/ui)
- Button
- Card
- Dialog
- Sheet
- Dropdown Menu
- Input
- Label
- Textarea
- Toast
- Badge

## Getting Started

1. Clone the repository
   ```bash
   git clone [repository-url]
   cd mm-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Copy `.env.example` to `.env.local` and fill in:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   RESEND_API_KEY=your_resend_api_key
   GOOGLE_AI_API_KEY=your_gemini_api_key
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Development Guidelines

- Use TypeScript for all new files
- Follow the existing component structure
- Use Tailwind classes for styling
- Implement proper error handling
- Add appropriate loading states
- Ensure responsive design
- Follow accessibility best practices
- Use server actions for data mutations
- Import actions from index file

## Database Schema

The application uses Supabase with the following main tables:
- `profiles` - User profiles and roles
- `artworks` - Artwork listings and metadata
- `transactions` - Payment records
- `artist_applications` - Artist application tracking
- `artwork_embeddings` - Vector embeddings for artwork search

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[License Type] - See LICENSE file for details

## Documentation

- [Implementation Details](./docs/implementation.md)
- [Navigation System](./docs/navigation.md)
- [Todo List](./docs/todo.md)
