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
  - Stripe Connect integration for payments

- **Admin Dashboard**
  - Artist application review
  - User management
  - Platform statistics
  - Content moderation

- **Modern Tech Stack**
  - Next.js 13 with App Router
  - Supabase for backend and auth
  - TailwindCSS for styling
  - shadcn/ui components
  - TypeScript for type safety
  - Stripe for payments

## Project Structure

```
mm-app/
├── app/                  # Next.js 13 App Router pages
│   ├── (auth-pages)/    # Authentication pages
│   ├── admin/           # Admin dashboard
│   ├── artist/          # Artist features
│   └── profile/         # User profile management
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── nav/            # Navigation components
├── lib/                # Core utilities
│   ├── supabase/       # Supabase client utilities
│   ├── stripe/         # Stripe integration
│   └── emails/         # Email templates
└── hooks/              # Custom React hooks
```

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

## Database Schema

The application uses Supabase with the following main tables:
- `profiles` - User profiles and roles
- `artworks` - Artwork listings
- `transactions` - Payment records
- `artist_applications` - Artist application tracking

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[License Type] - See LICENSE file for details
