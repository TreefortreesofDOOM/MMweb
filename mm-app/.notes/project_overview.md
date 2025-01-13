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
- **Payment Processing**: Stripe Integration with Wall Type Support

### AI Features
- Vector embeddings for artwork similarity search
- AI-powered art description and categorization
- Multiple AI providers (OpenAI, Google Vertex AI)
- Conversational AI for artwork inquiries
- MM AI automated posting system (ADMIN ONLY)
- Unified AI client for consistent provider interface
- AI-generated content in user feeds

## Core Features

### For Artists
- Artist profiles with portfolio management
- Artwork upload and management
- Sales tracking and analytics
- Verification system for artist status
- Community engagement features
- Store management with wall type pricing
  - Variable pricing for Trust Wall
  - Fixed pricing for other wall types
  - Payment link status tracking
  - Automated price validation

### For Patrons
- Artwork discovery and search
- Collection management
  - Private/public collection settings
  - Custom ordering of artworks
  - Collection statistics
- Purchase history
- Favorite artworks
- Personalized recommendations
- Enhanced feed system with AI content

### For All Users
- User profiles and preferences
- Theme customization (light/dark/system)
- Real-time notifications
- Social features (following, interactions)
- Gallery visit tracking
- Integrated feed system with mixed content types
  - Artist posts
  - MM AI generated content
  - Enhanced content visibility rules

## Database Structure

### Key Entities
- **Profiles**: User profiles with role-based access
- **Artworks**: Artwork listings with metadata
- **Collections**: User-curated artwork collections
- **Transactions**: Payment and purchase records
- **Gallery Visits**: Physical gallery interaction tracking
- **Store Products**: Wall type-specific product listings
- **AI Posts**: MM AI generated content

### Features
- Role-based access control (user, artist, admin, patron, agent)
- Automated engagement scoring
- Vector similarity search for artworks
- Real-time updates and notifications
- Ghost profiles for anonymous purchases
- Wall type-specific pricing rules
- AI content integration

## Security & Performance
- Type-safe database operations
- Rate limiting with Upstash
- Secure payment processing
- Image optimization and CDN delivery
- Protected API routes
- Enhanced authentication for admin and agent roles
- Stripe webhook signature verification

## Integration Points
- Stripe for payments with wall type support
- Email service (Resend)
- AI providers (OpenAI, Google)
  - Unified AI client interface
  - Server-side AI function implementation
  - Client/server separation for AI operations
- Analytics and tracking
- Social media connections

## Development Workflow
- TypeScript for type safety
- ESLint and Prettier for code quality
- Supabase migrations for database changes
- Environment-based configuration
- Automated testing setup
- Focused commit strategy with clear categorization
- Comprehensive documentation maintenance