# Instructions

## Key Instructions

- Ensure you have Node.js and npm installed.
- Install Supabase CLI for local development.
- Configure environment variables in `.env.local`.
- Use `npm run dev` to start the development server.
- Follow the directory structure for adding new features or components.

## Setup [DONE]

1. Clone the repository
2. Run `npm install`
3. Copy `.env.local.example` to `.env.local` and update the environment variables:
   ```
   # Production Supabase
   # NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Local Development Supabase
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key

   # SMTP Configuration (for email functionality)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-smtp-password
   SMTP_SENDER=your-email@example.com
   SMTP_ADMIN=your-email@example.com
   ```
4. Install Supabase CLI and start local instance:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Start local Supabase
   supabase start
   ```
5. Run `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Local Development

### Supabase Local Setup

The local Supabase instance runs on:
- API: http://localhost:54321
- Studio: http://localhost:54323
- Inbucket (Email Testing): http://localhost:54324

Database migrations are located in `supabase/migrations/` and include:
- Profile table creation
- Social fields for profiles
- Trigger for automatic profile creation

### Email Configuration

For local development, emails are captured by Inbucket instead of being sent. You can view them at http://localhost:54324.

For production, configure SMTP settings in `.env.local` and `supabase/config.toml`.

## Development

The application is built with:
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Backend/Database)
- Shadcn UI Components

### Complete Directory Structure

#### `/public` Directory
- `/public/images`
  - `/favicons`: Application favicons
  - `/logos`: Brand logos (black/white variants)

#### `/app` Directory (Next.js App Router)
- `/app/(auth-pages)`
  - Purpose: Authentication related pages
  - Contents: Sign-in, sign-up, password reset pages
  - Route Group: Isolated auth layout

- `/app/auth`
  - Purpose: Authentication utilities and handlers
  - Contents: Auth middleware, callbacks, session management

- `/app/notes`
  - Purpose: Notes feature implementation
  - Contents: Notes listing, creation, and management
  - Features: Supabase integration for notes CRUD

- `/app/protected`
  - Purpose: Protected routes requiring authentication
  - Contents: User-specific features and pages

Core Files:
- `actions.ts`: Server actions for form handling
- `layout.tsx`: Root layout with navigation and theme
- `page.tsx`: Homepage component
- `globals.css`: Global styles and Tailwind imports

#### `/components` Directory
- `/components/ui`
  - Purpose: Shadcn UI components
  - Contents: Buttons, inputs, cards, modals, dropdowns

- `/components/typography`
  - Purpose: Text-related components
  - Contents: Headings, paragraphs, text styles

- `/components/tutorial`
  - Purpose: Tutorial-related components
  - Contents: Tutorial steps, guides

Individual Components:
- `deploy-button.tsx`: Deployment action button
- `env-var-warning.tsx`: Environment variable warnings
- `form-message.tsx`: Form feedback messages
- `header-auth.tsx`: Authentication header
- `hero.tsx`: Updated hero section
- `submit-button.tsx`: Form submission button
- `theme-switcher.tsx`: Theme toggle component
- `logo.tsx`: Dynamic logo component with theme support

#### `/utils` Directory
- Purpose: Utility functions and helpers
- Contents:
  - Supabase client configuration
  - Authentication helpers
  - Type guards
  - Common utilities

#### `/lib` Directory
- Purpose: Core library code
- Contents:
  - Shared business logic
  - Custom hooks
  - Constants
  - Type definitions

#### `/docs` Directory
- Purpose: Project documentation
- Contents:
  - Setup instructions
  - API documentation
  - Development guides

#### `/supabase` Directory
- Purpose: Supabase configuration and migrations
- Contents:
  - `config.toml`: Supabase configuration including SMTP
  - `/migrations`: Database schema and triggers
  - `/.branches`: Branch management
  - `/.temp`: Temporary Supabase files

#### Build and Configuration
- `/.next`
  - Purpose: Next.js build output
  - Contents: Compiled assets, cached files

- `/node_modules`
  - Purpose: Package dependencies
  - Contents: Installed npm packages

#### Configuration Files
- `.env.local`: Environment variables
- `next.config.ts`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS settings
- `tsconfig.json`: TypeScript configuration
- `postcss.config.js`: PostCSS plugins
- `components.json`: UI component configuration
- `middleware.ts`: Next.js request middleware

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `supabase start` - Start local Supabase instance
- `supabase stop` - Stop local Supabase instance
- `supabase status` - Check local Supabase status

### Dependencies

#### Core Dependencies
1. **Next.js & React**
   - `next`: Next.js framework
   - `react`: v19.0.0 - Core React library
   - `react-dom`: v19.0.0 - React DOM rendering

2. **Supabase Integration**
   - `@supabase/ssr`: Server-side rendering utilities
   - `@supabase/supabase-js`: Supabase client library

3. **UI Components & Styling**
   - Radix UI Components:
     - `@radix-ui/react-checkbox`: Accessible checkbox
     - `@radix-ui/react-dropdown-menu`: Dropdown menu
     - `@radix-ui/react-label`: Label component
     - `@radix-ui/react-slot`: Component composition
   - `lucide-react`: Icon library
   - `next-themes`: Theme management
   - `class-variance-authority`: Variant classes utility
   - `clsx`: className string constructor

4. **CSS & Styling**
   - `autoprefixer`: CSS vendor prefix automation
   - `tailwindcss`: Utility-first CSS framework
   - `tailwind-merge`: Tailwind class merging
   - `tailwindcss-animate`: Tailwind animation plugin

#### Development Dependencies
1. **TypeScript & Types**
   - `typescript`: v5.7.2
   - `@types/node`: v22.10.2
   - `@types/react`: v19.0.2
   - `@types/react-dom`: v19.0.2

2. **Code Quality**
   - `prettier`: v3.3.3 - Code formatter

3. **Build Tools**
   - `postcss`: v8.4.49 - CSS post-processor

