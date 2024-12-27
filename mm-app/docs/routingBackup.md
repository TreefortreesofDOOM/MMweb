## Current Routing Structure Backup (Pre-Reorganization)

### Root Level Structure
```
app/
├── page.tsx                 # Home page
├── layout.tsx              # Root layout with auth and theme providers
├── globals.css            # Global styles
├── (auth-pages)/          # Authentication pages group
├── gallery/               # Gallery pages
├── artist/                # Single artist view
├── admin/                # Admin section
├── profile/              # User profile
├── artists/              # Artists listing
├── api/                  # API routes
├── artwork/              # Artwork related pages
├── auth/                 # Auth utilities
└── protected/            # Protected routes
```

### Detailed Route Analysis

1. Authentication System:
   - Core Authentication:
     - `(auth-pages)/sign-in/` → Sign in functionality
     - `(auth-pages)/sign-up/` → Registration
     - `(auth-pages)/reset-password/` → Password reset flow
     - `auth/callback/` → OAuth and email verification handling
   
   - Authentication Dependencies:
     - Uses Supabase Auth
     - Middleware checks for authentication state
     - Protected routes redirect to /sign-in if unauthenticated

2. Role-Based Access:
   - Admin Routes:
     - `/admin/*` → Requires admin role
     - `/admin/applications` → Artist application management
     - `/admin/dashboard` → Admin overview
   
   - Artist Routes:
     - `/artist/*` → Requires artist role
     - `/artist/artworks` → Artist's artwork management
     - `/artist/dashboard` → Artist overview

3. Public Routes Architecture:
   - Main Public Pages:
     - `/` → Home page with hero section
     - `/gallery` → Public artwork gallery
     - `/artists` → Artist directory
     - `/artwork/[id]` → Individual artwork view
   
   - Public Access Features:
     - Artwork browsing
     - Artist profiles
     - Search functionality

4. Protected Routes Structure:
   - User Management:
     - `/profile` → User profile management
     - `/profile/edit` → Profile editing
     - `/protected/*` → Generic protected routes
   
   - Access Control:
     - Requires authentication
     - Role-specific redirects
     - Session management

### Authentication Flow & Middleware

1. Middleware Configuration (`middleware.ts`):
   ```typescript
   - Handles session refresh
   - Protects routes under /protected and /profile
   - Manages auth redirects
   ```

2. Auth Actions (`lib/actions/auth.ts`):
   ```typescript
   - signUpAction: Email verification flow
   - signInAction: Credential verification
   - forgotPasswordAction: Password reset
   - resetPasswordAction: Password update
   ```

### Layout Hierarchy

1. Root Layout (`app/layout.tsx`):
   - Global providers:
     - ThemeProvider
     - Toaster
     - SiteHeader
   - User role detection
   - Navigation state

2. Auth Layout (`(auth-pages)/layout.tsx`):
   - Centered container
   - Auth-specific styling
   - Form layouts

3. Role-Specific Layouts:
   - AdminLayout: Admin dashboard structure
   - ArtistLayout: Artist workspace layout
   - Protected layout: Authenticated user layout

### Navigation Dependencies

1. Main Navigation:
   - Public routes accessible to all
   - Dynamic links based on auth state
   - Role-based menu items

2. Role Navigation:
   - Admin navigation items
   - Artist dashboard navigation
   - Protected route navigation

3. Auth State Dependencies:
   - Login/Signup visibility
   - Profile access
   - Role-specific redirects

### Critical Components and Dependencies

1. Layout Components:
   - Root layout (layout.tsx)
   - Auth pages layout
   - Role-specific layouts (admin/artist)
   - Protected routes layout

2. Auth Components:
   - AuthForm
   - SubmitButton
   - FormMessage

3. Navigation Components:
   - SiteHeader
   - MainNav
   - RoleNav
   - SidebarNav

4. Middleware:
   - Authentication checking
   - Session management
   - Route protection
   - Role verification

### Data Flow Dependencies

1. Authentication Flow:
   - Sign-in → Profile redirect
   - Sign-up → Email verification
   - Password reset → Auth callback

2. Role-Based Flow:
   - Admin routes → Role verification
   - Artist routes → Application status
   - Protected routes → Auth status

3. Content Access:
   - Public content → No auth required
   - Protected content → Auth required
   - Role content → Role verification

---

Phase 1: Preparation & Backup
Create a backup of the current routing structure
Document all existing route dependencies and relationships
Phase 2: Create New Route Groups
Create the following route groups:
Phase 3: Public Routes Migration
Move to (public) group:
artists/ directory
artist/ directory
artwork/ directory
gallery/ directory
Update any imports and paths in these components
Ensure layout.tsx and relevant providers are properly configured
Phase 4: Protected Routes Migration
Move to (protected) group:
profile/ directory
protected/ directory
Set up middleware for authentication
Update navigation and routing references
Phase 5: Admin Routes Migration
Move to (admin) group:
admin/ directory
Implement admin-specific middleware
Update admin navigation components
Phase 6: Auth Routes Update
Review current (auth-pages) structure
Rename to (auth) for consistency
Ensure sign-in/sign-up flows remain intact
Phase 7: API Routes
Keep api/ directory at root level
Review and update any API endpoints if needed
Phase 8: Update Dependencies
Update imports in all components
Update navigation components
Update any route references in:
Navigation bars
Links
Redirects
Auth flows
Phase 9: Middleware Configuration
Configure middleware for protected routes
2. Set up admin route protection
Update authentication flows
Phase 10: Testing Plan
Test all public routes accessibility
Verify protected routes authentication
Test admin routes protection
Verify auth flows:
Sign in
Sign up
Password reset
Redirects
Test navigation between groups
Verify API endpoints
Test error boundaries and 404 pages
Phase 11: Documentation Update
1. Update routing documentation
Document new structure
Update README with new organization
Document any breaking changes
Each phase will require careful implementation and testing before moving to the next. Would you like me to proceed with any specific phase, or would you like to modify any part of this plan?