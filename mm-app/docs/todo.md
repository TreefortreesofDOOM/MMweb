# TODO List

## Bugs

- the count does not work on admin dashboard for pending applications.
- upload image progress bar does not have animation.


## Email Templates

### Artist Application Approval
```html
<h2>Congratulations!</h2>
<p>Your application to become an artist on Meaning Machine has been approved.</p>
<p>You can now access the artist features and start uploading your artwork.</p>
<p>Welcome to the Meaning Machine community!</p>
```

### Artist Application Rejection
```html
<h2>Application Update</h2>
<p>Thank you for your interest in becoming an artist on Meaning Machine.</p>
<p>After careful review, we regret to inform you that we cannot approve your application at this time.</p>
<p><strong>Reason:</strong> {rejectionReason}</p>
<p>You're welcome to apply again in the future.</p>
```

## Pending Tasks

### Email System
- [ ] Move email templates to a separate file
- [ ] Add proper error handling for email sending
- [ ] Add email preview functionality for admins
- [ ] Add email sending queue for reliability
- [ ] Add email templates for:
  - [ ] Welcome email
  - [ ] Password reset
  - [ ] Email verification
- [ ] Complete domain verification for meaningmachine.com in Resend
- [ ] Update email sender from `onboarding@resend.dev` to `noreply@meaningmachine.com` in:
  - `app/api/test-email/route.ts`
  - `utils/emails/artist-notifications.ts`

### Stripe Integration
- [ ] Add Stripe Connect fields to profiles table:
  ```sql
  ALTER TABLE public.profiles
  ADD COLUMN stripe_account_id text,
  ADD COLUMN stripe_account_status text,
  ADD COLUMN stripe_account_created_at timestamp with time zone,
  ADD COLUMN stripe_account_updated_at timestamp with time zone,
  ADD COLUMN stripe_charges_enabled boolean DEFAULT false,
  ADD COLUMN stripe_payouts_enabled boolean DEFAULT false,
  ADD COLUMN stripe_details_submitted boolean DEFAULT false;
  ```
- [ ] Create Stripe Connect account on artist approval
- [ ] Add Stripe Connect onboarding flow
- [ ] Add Stripe Connect login link endpoint
- [ ] Add Stripe webhook handler for account updates
- [ ] Add payout management
- [ ] Add earnings dashboard

### Artist Management
- [ ] Add artist dashboard
- [ ] Add portfolio management
- [ ] Add artwork upload functionality
- [ ] Add commission request system

### Admin Features
- [ ] Add admin dashboard
- [ ] Add user management
- [ ] Add content moderation tools
- [ ] Add analytics and reporting

### General
- [ ] Add proper error handling throughout the application
- [ ] Add loading states for all actions
- [ ] Add proper TypeScript types for all components
- [ ] Add unit tests
- [ ] Add end-to-end tests 


## Key Recommendations

- [x] Move artist-application under `/profile/applications`
- [x] Consolidate all actions into `/lib/actions`
- [ ] Group dashboard-related pages under a common layout
- [ ] Keep public routes (`/artists`, `/artworks`) separate from private ones
- [ ] Use route groups (parentheses) to better organize related pages
- [ ] Consider moving some utility routes (like `ai-test`) to a development-only group

## Benefits

- [ ] Clearer separation between public and private routes
- [ ] More intuitive URL structure 
- [ ] Better organization of related functionality
- [ ] Easier to maintain and scale
- [ ] Clearer distinction between user roles and permissions

> Would you like me to elaborate on any of these points or provide more specific recommendations for certain areas?