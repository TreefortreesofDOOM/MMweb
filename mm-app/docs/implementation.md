# Stripe Integration Status

## Completed Features [✅]

### Initial Setup
- [x] Install required packages (`stripe`, `@stripe/stripe-js`)
- [x] Configure environment variables
- [x] Set up server-side Stripe client
- [x] Set up client-side Stripe loader

### Database Schema
- [x] Add Stripe fields to profiles table
- [x] Create transactions table
- [x] Apply migrations successfully

### Artist Onboarding
- [x] Create Stripe Connect Express accounts
- [x] Handle onboarding redirects
- [x] Process webhook updates
- [x] Update profile status
- [x] Add dashboard UI components
- [x] Handle session expiry

### Webhooks
- [x] Set up webhook endpoint
- [x] Verify webhook signatures
- [x] Handle account.updated events
- [x] Handle payment_intent events

## Next Phase: Payment Implementation [🚧]

### 1. Payment Intent Endpoint
- [x] Create `/api/stripe/payment-intent` route
- [x] Implement fee calculations (50% platform fee)
- [x] Validate artwork availability
- [x] Include metadata for tracking

### 2. Purchase UI
- [ ] Add purchase button to artwork detail page
- [ ] Implement Stripe Elements for card input
- [ ] Show price breakdown with fees
- [ ] Handle loading and error states

### 3. Transaction Management
- [ ] Create transaction records
- [ ] Update status via webhooks
- [ ] Link to artworks and users
- [ ] Handle refund flow

### 4. Testing Requirements
- [ ] Test successful payments
- [ ] Test failed payments
- [ ] Test refund process
- [ ] Verify fee calculations
- [ ] Test webhook handling

---

[Previous implementation details below]

# AI Gallery Assistant Application Architecture (Detailed Implementation Guide)

## Status Legend
[✅] Complete
[🔄] In Progress
[⬜] Not Started
[🚫] Blocked
[🔍] Needs Review

## Current Implementation Priorities

### 1. Artist Management Features [✅]
- Create artist application table in Supabase [✅]
- Implement artist application workflow [✅]
- Add artist approval process [✅]
- Create artist dashboard [✅]
- Set up artist portfolio management [✅]
- Implement RLS policies for artist features [✅]
- Set up email notifications [✅]

### 2. Artwork Management Features [🔄]
- Create artwork database tables in Supabase [✅]
- Implement artwork upload endpoints [✅]
- Set up file storage with Supabase [✅]
- Add artwork gallery view [✅]
- Create artwork moderation workflow [🔄]
- Add artwork pricing and availability management [✅]
- Add multiple image support for artworks [✅]
- Implement publish/unpublish functionality [✅]
- Add artwork status management [✅]

### 3. Admin Features [🔄]
- Create admin role and permissions [✅]
- Implement admin dashboard [✅]
- Add artwork approval workflow [🔄]
- Add admin-specific API endpoints [✅]
- Implement admin dashboard with:
  - Artist approval management [✅]
  - Artwork approval workflow [🔄]
  - User role management [✅]
  - Platform metrics [🔄]

### 4. Stripe Integration [🔄]
- Set up Stripe Connect Express accounts [🔄]
- Implement 50/50 revenue split [🔄]
- Create transaction tracking table [🔄]
- Add webhook handlers for payment events [🔄]
- Set up artist onboarding flow [🔄]
- Implement basic sales analytics [⬜]
- Add Stripe Express dashboard links [🔄]

### 5. AI Gallery Assistant [⬜]
- Set up Google Cloud Project [✅]
- Enable Multimodal Live API [⬜]
- Create WebSocket proxy server [⬜]
- Implement chat interface [⬜]
- Add session management [⬜]
- Set up real-time streaming [⬜]
- Implement rate limiting [⬜]

### 6. AI Artist Assistant
- available to all artists.
- helps create and manage their portfolios.
- helps write artist statements.
- helps write artist bios.
- helps write artist marketing materials.
- helps write artist press releases.
- helps write artist sales materials.
- helps write art descriptions for their artworks. Needs to have access to the images and be able to generate text from the images.
- must have access to all artists and their portfolios, bios, website and social media.
- must have access to all art history and art movements.
- must have access to all art market analysis.
- must have access to all art techniques and mediums.
- must have access to all art curation and exhibition design.
- must have access to all art conservation and preservation.
- must have access to all digital art and NFTs.

### 7. AI Patron Assistant
- helps art buyers find art
- helps art buyers understand art
- available to all users.
- must have access to all artworks available for sale
- must have access to all artists and their portfolios, bios, website and social media.
- must have access to all art history and art movements.
- must have access to all art market analysis.
- must have access to all art techniques and mediums.
- must have access to all art curation and exhibition design.
- must have access to all art conservation and preservation.
- must have access to the artbuyer (user) profile, transaction history, and purchase history. 
- Must understand the artbuyer's preferences and purchase history in order to make recommendations.

## Implementation Order
1. **Artist Application Page & Form** [✅]
   - Create `/artist-application` route [✅]
   - Build application form component [✅]
   - Implement form validation [✅]
   - Add submission state handling [✅]
   - Show application status [✅]
   - Handle draft saving [✅]

2. **Server Actions for Submission** [✅]
   - Create submission endpoint [✅]
   - Validate form data [✅]
   - Update profile status [✅]
   - Store application data [✅]
   - Handle error states [✅]
   - Implement draft saving [✅]

3. **Admin Review Interface** [✅]
   - Create admin dashboard view [✅]
   - List pending applications [✅]
   - Show application details [✅]
   - Add approval/rejection actions [✅]
   - Update user roles [✅]
   - Store rejection reasons [✅]

4. **Email Notifications** [✅]
   - Add submission confirmations [✅]
   - Send approval notifications [✅]
   - Send rejection notifications [✅]
   - Include next steps in emails [✅]
   - Switch to meaningmachine.com domain [✅]

5. **Artist Upload Features** [✅]
   - Create artwork upload form [✅]
   - Implement image upload to Supabase storage [✅]
   - Add multiple image support [✅]
   - Implement primary image selection [✅]
   - Add image reordering [✅]
   - Create artwork gallery view [✅]
   - Add publish/unpublish functionality [✅]
   - Implement artwork status management [✅]
   - Add artwork pricing [✅]
   - Create artist dashboard view [✅]

6. **Storage Implementation:** [✅]
   - Set up Supabase storage buckets [✅]
   - Configure storage policies [✅]
   - Implement file upload handlers [✅]
   - Add image optimization [✅]
   - Set up CDN caching [✅]

7. **Database Schema:** [✅]
   - Create profiles table [✅]
   - Add artworks table [✅]
   - Set up RLS policies [✅]
   - Implement migrations [✅]
   - Add indexes for performance [✅]

8. **Admin Interface:** [🔄]
   - Create admin dashboard [✅]
   - Add user management [✅]
   - Implement artwork moderation [🔄]
   - Add analytics views [🔄]
   - Create reporting tools [⬜]

9. **Deployment:** [🔄]
   - Set up Vercel project [🔄]
   - Configure environment variables [✅]
   - Set up production database [🔄]
   - Add monitoring tools [⬜]
   - Configure backup systems [⬜]

## Initial Setup & Configuration [⬜]

### Install required packages:

### Set up environment variables:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CONNECT_CLIENT_ID`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Database Schema Updates [⬜]

### Add Stripe fields to profiles table:
- Create transactions table:

## Artist Onboarding Flow [⬜]

- Create Stripe Connect Express account when artist is approved
- Generate onboarding link
- Handle onboarding completion webhook
- Update artist profile with Stripe account status

## Payment Flow [⬜]

- Implement artwork purchase button
- Create payment intent with platform fee
- Handle successful payments
- Update artwork availability
- Record transaction

## Webhook Handlers [⬜]

- Set up webhook endpoint
- Handle account updates
- Handle payment events
- Handle payout events
- Implement error handling

---

## Overview
This document provides a step-by-step guide to implement the AI Gallery Assistant Application. It is designed to be accessible for junior web developers while maintaining scalability, security, and best practices.

---

## 1. Frontend and Server Components [⬜]

### **Goal:** Create a dynamic, responsive web interface with server-side functionality.

**Technologies:**
- Framework: Next.js App Router [✓]
- Hosting: Vercel [⬜]
- UI Framework: Tailwind CSS [✓]
- Components: Shadcn/UI [✓]
- Backend: Supabase [✓]

### **Step-by-Step Implementation:**
1. **Project Setup:** [✓]
   - Install Next.js [✓]
   - Initialize Git and set up a repository [✓]
   - Deploy to Vercel [⬜]

2. **Directory Structure:** [✓]

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
  │   │   ├── button.tsx
  │   │   ├── card.tsx
  │   │   ├── dialog.tsx
  │   │   ├── dropdown-menu.tsx
  │   │   ├── form.tsx
  │   │   ├── input.tsx
  │   │   └── [other shadcn components]
  │   └── submit-button.tsx
  ├── docs/
  │   └── implementation.md
  ├── lib/
  │   └── utils.ts
  ├── public/
  │   └── images/
  │       ├── favicons/
  │       └── logos/
  ├── scripts/
  │   └── create-test-users.ts
  ├── supabase/
  │   ├── migrations/
  │   │   ├── 20240124000003_create_artwork_storage.sql
  │   │   ├── 20240124000004_update_artworks_image_urls.sql
  │   │   ├── 20240124000005_add_artwork_images.sql
  │   │   └── [other migrations]
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
  
3. **Authentication Flow:** [✅]
   - Supabase Auth integration [✅]
   - Add profile management [✅]
   - Implement role-based access [✅]
   - Add protected routes [✅]
   - Set up auth middleware [✅]

4. **API Integration:** [✅]
   - Add `.env.local` for environment variables [✅]
   - Configure Supabase client [✅]
   - Set up server-side API routes [✅]
   - Implement server actions [✅]
   - Add error handling [✅]

5. **Testing:** [🔄]
   - Install Jest and React Testing Library [⬜]
   - Write tests for components [⬜]
   - Add integration tests [⬜]
   - Set up CI/CD pipeline [⬜]

6. **Artist Features:** [✅]
   - Create artwork upload form [✅]
   - Implement image upload to storage [✅]
   - Add multiple image support [✅]
   - Create artwork gallery view [✅]
   - Add publish/unpublish functionality [✅]
   - Implement artwork status management [✅]
   - Add artwork pricing [✅]

7. **Storage Implementation:** [✅]
   - Set up Supabase storage buckets [✅]
   - Configure storage policies [✅]
   - Implement file upload handlers [✅]
   - Add image optimization [✅]
   - Set up CDN caching [✅]

8. **Database Schema:** [✅]
   - Create profiles table [✅]
   - Add artworks table [✅]
   - Set up RLS policies [✅]
   - Implement migrations [✅]
   - Add indexes for performance [✅]

9. **Admin Interface:** [🔄]
   - Create admin dashboard [✅]
   - Add user management [✅]
   - Implement artwork moderation [🔄]
   - Add analytics views [🔄]
   - Create reporting tools [⬜]

10. **Deployment:** [🔄]
    - Set up Vercel project [🔄]
    - Configure environment variables [✅]
    - Set up production database [🔄]
    - Add monitoring tools [⬜]
    - Configure backup systems [⬜]


---

## 2. Backend Implementation [✓]

### Technologies: [✓]
- Database: Supabase [✓]
- Authentication: Supabase Auth [✓]
- Storage: Supabase Storage [✓]
- Hosting: Vercel [✓]

### Step-by-Step Implementation:

#### Database Integration: [DONE]
- Supabase setup and configuration [DONE]
- User profiles table [DONE]
- Authentication tables [DONE]
- Migration scripts [DONE]

#### Database Schema & Role-Based Access Control: [DONE]

#### Artist Application Workflow: [✅]

1. **Application Submission** [✅]
   - Form validation and data collection
   - Portfolio URL validation
   - Artist statement requirements
   - Social media integration
   - Previous exhibitions tracking
   - Draft saving capability

2. **Status Management** [✅]
   - Draft state for incomplete applications
   - Pending state for submitted applications
   - Approved state for accepted artists
   - Rejected state with reason tracking
   - Email notifications for status changes

3. **Admin Review Process** [✅]
   - Application queue management
   - Detailed application view
   - Approval/rejection actions
   - Feedback mechanism
   - Automatic role updates

4. **Profile Updates** [✅]
   - Automatic status synchronization
   - Role assignment on approval
   - Profile badge updates
   - Dashboard access control
   - Artist-specific features unlock

5. **Security Measures** [✅]
   - One active application per user
   - Role-based access control
   - Data validation
   - Rate limiting
   - Audit logging

6. **Integration Points** [✅]
   - Profile system
   - Email notifications
   - Storage system for portfolios
   - Admin dashboard
   - Artist dashboard

7. **User Experience** [✅]
   - Progress tracking
   - Status notifications
   - Clear feedback
   - Error handling
   - Success messaging

#### 9. Add artist features:
  - Artwork upload interface
  - Portfolio management
  - Sales tracking
  - Payout history
  - Analytics dashboard

#### 10. Admin dashboard features:
  - Artist approval queue
  - Artist management interface
  - Artwork moderation tools
  - User role management
  - Platform metrics

### Next Steps:

2. **Stripe Integration:** [⬜]
   
   - Database Schema for Transaction Tracking:
     ```sql
     -- Track essential transaction data
     CREATE TABLE transactions (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       stripe_payment_intent_id TEXT NOT NULL UNIQUE,
       artwork_id UUID REFERENCES artworks(id),
       buyer_id UUID REFERENCES auth.users(id),
       artist_id UUID REFERENCES auth.users(id),
       amount_total INTEGER NOT NULL,      -- Total amount in cents
       status TEXT NOT NULL,               -- 'succeeded', 'failed', 'refunded'
       created_at TIMESTAMPTZ DEFAULT NOW(),
       metadata JSONB,                     -- Additional data like artwork title at time of sale
       updated_at TIMESTAMPTZ DEFAULT NOW()
     );

     -- Add RLS policies
     ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

     -- Users can view their own transactions
     CREATE POLICY "Users can view their own transactions"
       ON transactions FOR SELECT
       USING (buyer_id = auth.uid() OR artist_id = auth.uid());

     -- Admins can view all transactions
     CREATE POLICY "Admins can view all transactions"
       ON transactions FOR SELECT
       USING (
         EXISTS (
           SELECT 1 FROM profiles
           WHERE profiles.user_id = auth.uid()
           AND profiles.role = 'admin'
         )
       );
     ```

   - Fee Calculation:
     ```typescript
     // utils/stripe/calculate-fees.ts
     interface FeeCalculation {
       platformFee: number;    // Our 50% commission
       artistAmount: number;   // Net amount to artist
       customerAmount: number; // Total charged to customer
     }

     export function calculateFees(basePrice: number): FeeCalculation {
       const platformCommissionRate = 0.50;  // 50%
       const platformFee = Math.round(basePrice * platformCommissionRate);
       const artistAmount = basePrice - platformFee;

       return {
         platformFee,
         artistAmount,
         customerAmount: basePrice
       };
     }
     ```

   - Payment Intent Creation:
     ```typescript
     // app/api/stripe/create-payment/route.ts
     export async function POST(req: Request) {
       try {
         const { basePrice, artistAccountId, artworkId } = await req.json();
         const supabase = createRouteHandlerClient({ cookies });
         
         const fees = calculateFees(basePrice);
         const user = await supabase.auth.getUser();

         // Get artwork details for metadata
         const { data: artwork } = await supabase
           .from('artworks')
           .select('title, artist_id')
           .eq('id', artworkId)
           .single();

         // Create payment intent
         const paymentIntent = await stripe.paymentIntents.create({
           amount: fees.customerAmount,
           currency: 'usd',
           application_fee_amount: fees.platformFee,
           transfer_data: {
             destination: artistAccountId,
           },
           metadata: {
             artworkId,
             artworkTitle: artwork.title,
             buyerId: user.data.user?.id,
             artistId: artwork.artist_id
           }
         });

         // Record transaction
         await supabase.from('transactions').insert({
           stripe_payment_intent_id: paymentIntent.id,
           artwork_id: artworkId,
           buyer_id: user.data.user?.id,
           artist_id: artwork.artist_id,
           amount_total: fees.customerAmount,
           status: paymentIntent.status,
           metadata: {
             artwork_title: artwork.title,
             platform_fee: fees.platformFee,
             artist_amount: fees.artistAmount
           }
         });

         return NextResponse.json({
           clientSecret: paymentIntent.client_secret,
           fees
         });
       } catch (error) {
         // Error handling
       }
     }
     ```

   - Webhook Handler for Status Updates:
     ```typescript
     // app/api/webhooks/stripe/route.ts
     export async function POST(req: Request) {
       // ... webhook verification ...

       switch (event.type) {
         case 'payment_intent.succeeded':
         case 'payment_intent.payment_failed':
         case 'charge.refunded': {
           const paymentIntent = event.data.object;
           
           await supabase
             .from('transactions')
             .update({
               status: event.type === 'payment_intent.succeeded' ? 'succeeded' :
                       event.type === 'charge.refunded' ? 'refunded' : 'failed',
               updated_at: new Date().toISOString()
             })
             .eq('stripe_payment_intent_id', paymentIntent.id);
           break;
         }
       }
     }
     ```

   - Artist Dashboard Link Component:
     ```typescript
     // components/artist/stripe-dashboard-link.tsx
     export const StripeDashboardLink = async ({ accountId }: { accountId: string }) => {
       const loginLink = await stripe.accounts.createLoginLink(accountId);
       
       return (
         <Button asChild>
           <a href={loginLink.url} target="_blank" rel="noopener noreferrer">
             Manage Payments & Payouts
           </a>
         </Button>
       );
     };
     ```

   - Sales Analytics Component:
     ```typescript
     // components/admin/sales-analytics.tsx
     export const SalesAnalytics = async () => {
       const supabase = createServerComponentClient({ cookies });
       
       // Get total sales by month
       const { data: monthlySales } = await supabase
         .from('transactions')
         .select('amount_total, created_at')
         .eq('status', 'succeeded')
         .order('created_at', { ascending: false });

       // Get top selling artworks
       const { data: topArtworks } = await supabase
         .from('transactions')
         .select(`
           artwork_id,
           metadata->>'artwork_title' as title,
           count(*) as sale_count,
           sum(amount_total) as total_sales
         `)
         .eq('status', 'succeeded')
         .group('artwork_id, metadata->>"artwork_title"')
         .order('total_sales', { ascending: false })
         .limit(10);

       return (
         <div className="space-y-8">
           <div>
             <h3>Monthly Sales</h3>
             {/* Render monthly sales chart */}
           </div>
           <div>
             <h3>Top Selling Artworks</h3>
             {/* Render top artworks list */}
           </div>
         </div>
       );
     };
     ```

### 3. **Vector Database Implementation:** [⬜]
   - Enable pgvector in Supabase:
    ```sql
    CREATE EXTENSION IF NOT EXISTS vector;
    ```
   - Create tables for vector storage:
   ```sql
   CREATE TABLE artwork_embeddings (
     id uuid references artworks(id),
     embedding vector(1536)
   );
   ```
   - Implement embedding generation using OpenAI API
   - Add similarity search endpoints

### 4. **AI Gallery Assistant:** [⬜]
   - Set up Google Cloud Project:
     - Set up API key for Multimodal Live API
     - Note: Server-to-server authentication only
     - Consider rate limits (3 concurrent sessions per API key)

   - Create server-side implementation in `app/api/ai/`:
     - Install Google Generative AI library:
     ```bash
     npm install @google/generative-ai
     ```
     - Set up secure WebSocket proxy server
     - Handle authentication and session management
     - Implement rate limiting and error handling

### 5. Implement AI service in `utils/ai/`:
     ```typescript
     // Example Multimodal Live API implementation
     import { GoogleGenerativeAI } from "@google/generative-ai";

     const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
     const model = genAI.getGenerativeModel({ 
       model: "gemini-2.0-flash-exp"
     });

     // Session management
     const config = {
       generation_config: {
         response_modalities: ["TEXT"]
       }
     };

     // WebSocket session handling
     async function startAISession() {
       const session = await model.aio.live.connect(config);
       return session;
     }
     ```

   - Implement chat interface features:
     - Real-time conversation UI
     - Session management (15-minute limit)
     - Context preservation
     - Error handling and reconnection logic

   - Key limitations to handle:
     - Maximum session duration: 15 minutes
     - Context size limitations
     - No explicit session history (implement our own)
     - Rate limits: 4M tokens per minute
     - Server-side authentication required

#### Example workflow:
   1. User initiates session through secure server endpoint
   2. Server establishes WebSocket connection with Google API
   3. Real-time interaction through WebSocket proxy
   4. Server maintains conversation history
   5. Handle session timeouts and reconnection

   Development considerations:
   - Implement server-side session management
   - Handle WebSocket proxy security
   - Maintain conversation history in database
   - Implement graceful session timeout handling
   - Monitor rate limits and usage

5. **Analytics Integration:** [⬜]
   - Implement event tracking
   - Set up analytics dashboard
   - Track user interactions
   - Monitor AI assistant performance

### Development Guidelines:

1. **Code Organization:**
   - Keep AI/ML utilities in `utils/ai/` [⬜]
   - Payment logic in `utils/stripe/` [⬜]
   - Database queries in `utils/supabase/` [✅]
   - Components in `components/` [✅]
   - API routes in `app/api/` [🔄]

2. **Security Considerations:**
   - Secure API keys in environment variables [✅]
   - Implement proper rate limiting [⬜]
   - Set up Supabase RLS policies [✅]
   - Validate webhook signatures [⬜]
   - Sanitize AI inputs/outputs [⬜]

3. **Performance Optimization:**
   - Implement caching for embeddings [⬜]
   - Optimize vector searches [⬜]
   - Use streaming responses for AI [⬜]
   - Lazy load heavy components [⬜]
   - Monitor API usage [⬜]

4. **Testing Strategy:**
   - Unit tests for utilities [⬜]
   - Integration tests for AI features [⬜]
   - E2E tests for payment flows [⬜]
   - Mock external APIs in tests [⬜]
   - Test vector similarity accuracy [⬜]

- Create artist approval workflow with Stripe Connect:
  ```typescript
  // app/api/admin/approve-artist/route.ts
  import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
  import { stripe } from '@/utils/stripe';
  import { NextResponse } from 'next/server';
  import { cookies } from 'next/headers';

  export async function POST(req: Request) {
    try {
      const { userId, applicationId } = await req.json();
      const supabase = createRouteHandlerClient({ cookies });
      
      // Verify admin status
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (adminProfile?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Get user profile for Stripe account creation
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Get application details
      const { data: application } = await supabase
        .from('artist_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      // Create Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: userProfile.email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          url: application.social_media?.website || '',
          mcc: '5733', // Art Dealers and Galleries
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'manual' // Platform controls payouts initially
            }
          },
          payments: {
            statement_descriptor: 'ARTGALLERY',
            statement_descriptor_kana: null,
            statement_descriptor_kanji: null
          }
        }
      });

      // Create account link for Express onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/onboarding/refresh`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/onboarding/complete`,
        type: 'account_onboarding',
        collect: 'eventually_due',
      });

      // Update profile with Stripe account info and artist status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'artist',
          artist_status: 'approved',
          artist_approved_at: new Date().toISOString(),
          artist_approved_by: (await supabase.auth.getUser()).data.user?.id,
          stripe_account_id: account.id,
          stripe_onboarding_complete: false
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update application status
      await supabase
        .from('artist_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', applicationId);

      return NextResponse.json({ 
        success: true,
        onboardingUrl: accountLink.url 
      });
    } catch (error) {
      console.error('Artist approval error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  ```

- Add Stripe Connect onboarding components:
  ```typescript
  // components/artist/onboarding-status.tsx
  interface OnboardingStatusProps {
    stripeAccountId: string;
    onboardingComplete: boolean;
  }

  export const OnboardingStatus = async ({ 
    stripeAccountId, 
    onboardingComplete 
  }: OnboardingStatusProps) => {
    if (!onboardingComplete && stripeAccountId) {
      // Check account status and requirements
      const account = await stripe.accounts.retrieve(stripeAccountId);
      
      if (!account.details_submitted) {
        // Create new account link if needed
        const accountLink = await stripe.accountLinks.create({
          account: stripeAccountId,
          refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/onboarding/refresh`,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/artist/onboarding/complete`,
          type: 'account_onboarding',
        });

        return (
          <div>
            <h3>Complete Your Stripe Onboarding</h3>
            <p>Please complete your Stripe account setup to receive payments.</p>
            <Button asChild>
              <a href={accountLink.url}>Complete Setup</a>
            </Button>
          </div>
        );
      }
    }

    return (
      <div>
        <h3>Stripe Account Status</h3>
        <p>Your account is ready to receive payments.</p>
      </div>
    );
  };
  ```

- Update database schema for Stripe Connect:
```sql
  ALTER TABLE profiles
  ADD COLUMN stripe_account_id TEXT,
  ADD COLUMN stripe_onboarding_complete BOOLEAN DEFAULT FALSE;
  ```

- Add Stripe webhook handling:
  ```typescript
  // app/api/webhooks/stripe/route.ts
  import { headers } from 'next/headers';
  import { stripe } from '@/utils/stripe';
  import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
  import { cookies } from 'next/headers';
  import { NextResponse } from 'next/server';

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  export async function POST(req: Request) {
    try {
      const body = await req.text();
      const signature = headers().get('stripe-signature')!;

      // Verify webhook signature
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );

      const supabase = createRouteHandlerClient({ cookies });

      // Handle specific webhook events
      switch (event.type) {
        case 'account.updated': {
          const account = event.data.object;
          
          // Check if this update indicates onboarding completion
          if (
            account.details_submitted && 
            account.charges_enabled && 
            account.payouts_enabled && 
            account.capabilities?.card_payments === 'active' && 
            account.capabilities?.transfers === 'active'
          ) {
            // Update artist profile to mark onboarding as complete
            await supabase
              .from('profiles')
              .update({
                stripe_onboarding_complete: true,
                stripe_payouts_enabled: true,
                stripe_charges_enabled: true,
                stripe_updated_at: new Date().toISOString()
              })
              .eq('stripe_account_id', account.id);
          }
          break;
        }

        case 'account.application.deauthorized': {
          // Handle when an artist deauthorizes the platform
          const account = event.data.object;
          await supabase
            .from('profiles')
            .update({
              stripe_onboarding_complete: false,
              stripe_payouts_enabled: false,
              stripe_deauthorized_at: new Date().toISOString()
            })
            .eq('stripe_account_id', account.id);
          break;
        }
      }

      return NextResponse.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      return NextResponse.json(
        { error: 'Webhook handler failed' },
        { status: 400 }
      );
    }
  }
  ```

- Update database schema for webhook handling:
  ```sql
  ALTER TABLE profiles
  ADD COLUMN stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN stripe_updated_at TIMESTAMPTZ,
  ADD COLUMN stripe_deauthorized_at TIMESTAMPTZ;
  ```

- Configure webhook in Stripe Dashboard:
  1. Go to Stripe Dashboard > Developers > Webhooks
  2. Add endpoint URL: `https://your-domain.com/api/webhooks/stripe`
  3. Select events to listen for:
     - `account.updated`
     - `account.application.deauthorized`
  4. Get webhook signing secret and add to environment variables:
```bash
     STRIPE_WEBHOOK_SECRET=whsec_xxxxx
     ```

- Testing webhook handling:
  1. Use Stripe CLI for local testing:
     ```bash
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
     ```
  2. Trigger test webhook events:
     ```bash
     stripe trigger account.updated
     ```
  3. Monitor webhook events in Stripe Dashboard
  4. Verify database updates

- Configure Connect branding:
  1. Update Stripe Connect settings in Dashboard:
     - Set brand color and icon (128x128px)
     - Customize platform name
     - These settings affect emails sent by Stripe to artists

- Add Express dashboard link component:
  ```typescript
  // components/artist/stripe-dashboard-link.tsx
  export const StripeDashboardLink = async ({ accountId }: { accountId: string }) => {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    
    return (
      <Button asChild>
        <a href={loginLink.url} target="_blank" rel="noopener noreferrer">
          View Stripe Dashboard
        </a>
      </Button>
    );
  };
  ```

- Update database schema:
  ```sql
  ALTER TABLE profiles
  ADD COLUMN stripe_charges_enabled BOOLEAN DEFAULT FALSE;
  ```

- Add transaction and payout tracking tables:
  ```sql
  -- Track all transactions
  CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_payment_intent_id TEXT NOT NULL UNIQUE,
    artwork_id UUID REFERENCES artworks(id),
    buyer_id UUID REFERENCES auth.users(id),
    artist_id UUID REFERENCES auth.users(id),
    amount_total INTEGER NOT NULL,      -- Total amount charged to customer
    amount_platform INTEGER NOT NULL,   -- Platform's share including fees
    amount_artist INTEGER NOT NULL,     -- Artist's share
    stripe_fee INTEGER NOT NULL,        -- Total Stripe fee
    platform_fee INTEGER NOT NULL,      -- Platform's commission
    status TEXT NOT NULL,               -- 'succeeded', 'failed', 'refunded'
    currency TEXT NOT NULL DEFAULT 'usd',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    refunded_at TIMESTAMPTZ,
    error_message TEXT
  );

  -- Track artist payouts
  CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES auth.users(id),
    stripe_payout_id TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL,              -- 'pending', 'in_transit', 'paid', 'failed', 'canceled'
    arrival_date TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    failure_message TEXT
  );

  -- Track which transactions are included in each payout
  CREATE TABLE payout_transactions (
    payout_id UUID REFERENCES payouts(id),
    transaction_id UUID REFERENCES transactions(id),
    amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (payout_id, transaction_id)
  );

  -- Add RLS policies
  ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE payout_transactions ENABLE ROW LEVEL SECURITY;

  -- Transaction policies
  CREATE POLICY "Users can view their own transactions as buyer"
    ON transactions FOR SELECT
    USING (buyer_id = auth.uid());

  CREATE POLICY "Artists can view their sales"
    ON transactions FOR SELECT
    USING (artist_id = auth.uid());

  CREATE POLICY "Admins can view all transactions"
    ON transactions FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
      )
    );

  -- Payout policies
  CREATE POLICY "Artists can view their own payouts"
    ON payouts FOR SELECT
    USING (artist_id = auth.uid());

  CREATE POLICY "Admins can manage payouts"
    ON payouts FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
  ```

- Implement transaction tracking in payment flow:
  ```typescript
  // app/api/stripe/create-payment/route.ts
  export async function POST(req: Request) {
    try {
      const { basePrice, artistAccountId, artworkId } = await req.json();
      const supabase = createRouteHandlerClient({ cookies });
      
      const fees = calculateFees(basePrice);
      const user = await supabase.auth.getUser();

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: fees.customerAmount,
        currency: 'usd',
        application_fee_amount: fees.platformFee,
        transfer_data: {
          destination: artistAccountId,
        },
        metadata: {
          artworkId,
          buyerId: user.data.user?.id,
          artistId: artistAccountId,
          platformFee: fees.platformFee,
          artistAmount: fees.artistAmount
        }
      });

      // Record transaction
      await supabase.from('transactions').insert({
        stripe_payment_intent_id: paymentIntent.id,
        artwork_id: artworkId,
        buyer_id: user.data.user?.id,
        artist_id: artistAccountId,
        amount_total: fees.customerAmount,
        amount_platform: fees.platformFee,
        amount_artist: fees.artistAmount,
        stripe_fee: fees.stripeFee,
        platform_fee: fees.platformFee,
        status: paymentIntent.status,
        metadata: {
          payment_intent: paymentIntent.id,
          customer_email: user.data.user?.email
        }
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        fees
      });
    } catch (error) {
      // Error handling
    }
  }
  ```

- Add webhook handling for transaction updates:
  ```typescript
  // app/api/webhooks/stripe/route.ts
  export async function POST(req: Request) {
    // ... existing webhook verification ...

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        await supabase
          .from('transactions')
          .update({
            status: 'succeeded',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        
        await supabase
          .from('transactions')
          .update({
            status: 'failed',
            error_message: paymentIntent.last_payment_error?.message,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        
        await supabase
          .from('transactions')
          .update({
            status: 'refunded',
            refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', charge.payment_intent);
        break;
      }

      case 'payout.created':
      case 'payout.updated':
      case 'payout.paid':
      case 'payout.failed': {
        const payout = event.data.object;
        
        await supabase
          .from('payouts')
          .upsert({
            stripe_payout_id: payout.id,
            artist_id: payout.metadata?.artist_id,
            amount: payout.amount,
            currency: payout.currency,
            status: payout.status,
            arrival_date: payout.arrival_date,
            failure_message: payout.failure_message,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payout_id', payout.id);
        break;
      }
    }
  }
  ```

- Add transaction and payout display components:
  ```typescript
  // components/artist/sales-history.tsx
  export const SalesHistory = async () => {
    const supabase = createServerComponentClient({ cookies });
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, artworks(*)')
      .eq('artist_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false });

    return (
      <div className="space-y-4">
        <h2>Sales History</h2>
        {transactions?.map((transaction) => (
          <div key={transaction.id} className="border p-4 rounded">
            <p>Artwork: {transaction.artworks.title}</p>
            <p>Sale Amount: ${transaction.amount_total / 100}</p>
            <p>Your Earnings: ${transaction.amount_artist / 100}</p>
            <p>Date: {new Date(transaction.created_at).toLocaleDateString()}</p>
            <p>Status: {transaction.status}</p>
          </div>
        ))}
      </div>
    );
  };

  // components/artist/payout-history.tsx
  export const PayoutHistory = async () => {
    const supabase = createServerComponentClient({ cookies });
    const { data: payouts } = await supabase
      .from('payouts')
      .select('*')
      .eq('artist_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false });

    return (
      <div className="space-y-4">
        <h2>Payout History</h2>
        {payouts?.map((payout) => (
          <div key={payout.id} className="border p-4 rounded">
            <p>Amount: ${payout.amount / 100}</p>
            <p>Status: {payout.status}</p>
            <p>Expected Arrival: {
              payout.arrival_date 
                ? new Date(payout.arrival_date).toLocaleDateString()
                : 'Pending'
            }</p>
            {payout.failure_message && (
              <p className="text-red-500">Error: {payout.failure_message}</p>
            )}
          </div>
        ))}
      </div>
    );
  };
  ```
- Add admin payout management:
  ```typescript
  // app/api/admin/create-payout/route.ts
  export async function POST(req: Request) {
    try {
      const { artistId, amount } = await req.json();
      const supabase = createRouteHandlerClient({ cookies });

      // Verify admin status
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (adminProfile?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Get artist's Stripe account ID
      const { data: artistProfile } = await supabase
        .from('profiles')
        .select('stripe_account_id')
        .eq('id', artistId)
        .single();

      // Create payout
      const payout = await stripe.transfers.create({
        amount,
        currency: 'usd',
        destination: artistProfile.stripe_account_id,
        metadata: {
          artist_id: artistId
        }
      });

      return NextResponse.json({ payout });
    } catch (error) {
      console.error('Payout creation error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  ```

## Artist Application Process

### Application Flow
1. User Access
   - Available to any authenticated user
   - Accessible via profile page or navigation
   - One application per user

2. Form Submission
   - Artist statement/bio
   - Portfolio link
   - Instagram handle (optional)
   - Terms agreement
   - Status automatically updates to 'pending'

3. Admin Review
   - View pending applications
   - Review submission details
   - Approve or reject with optional reason
   - Automatic role update on approval

4. Notifications
   - Application submission confirmation
   - Approval/rejection notification
   - Email notifications via existing Supabase email setup
