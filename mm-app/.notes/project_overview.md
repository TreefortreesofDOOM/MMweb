# Project Overview

## Introduction
MM Web is a modern art marketplace platform built with Next.js 13+, focusing on connecting artists with art enthusiasts and collectors. The platform facilitates artwork discovery, collection management, and secure transactions between artists and patrons.

## Technical Stack

### Frontend
- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with Shadcn/UI components
- **State Management**: React Query & Context API
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Next.js API Routes
- **Payment Processing**: Stripe Integration

### AI Features
- Vector embeddings for artwork similarity search
- AI-powered art description and categorization
- Multiple AI providers (OpenAI, Google Vertex AI)
- Conversational AI for artwork inquiries

## Core Features

### For Artists
- Artist profiles with portfolio management
- Artwork upload and management
- Sales tracking and analytics
- Verification system for artist status
- Community engagement features

### For Patrons
- Artwork discovery and search
- Collection management
- Purchase history
- Favorite artworks
- Personalized recommendations

### For All Users
- User profiles and preferences
- Theme customization (light/dark/system)
- Real-time notifications
- Social features (following, interactions)
- Gallery visit tracking

## Database Structure

### Key Entities
- **Profiles**: User profiles with role-based access
- **Artworks**: Artwork listings with metadata
- **Collections**: User-curated artwork collections
- **Transactions**: Payment and purchase records
- **Gallery Visits**: Physical gallery interaction tracking

### Features
- Role-based access control (user, artist, admin, patron)
- Automated engagement scoring
- Vector similarity search for artworks
- Real-time updates and notifications
- Ghost profiles for anonymous purchases

## Security & Performance
- Type-safe database operations
- Rate limiting with Upstash
- Secure payment processing
- Image optimization and CDN delivery
- Protected API routes

## Integration Points
- Stripe for payments
- Email service (Resend)
- AI providers (OpenAI, Google)
- Analytics and tracking
- Social media connections

## Development Workflow
- TypeScript for type safety
- ESLint and Prettier for code quality
- Supabase migrations for database changes
- Environment-based configuration
- Automated testing setup