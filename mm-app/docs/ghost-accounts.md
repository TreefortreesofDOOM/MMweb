# Ghost Accounts Implementation

## Overview
Implementation plan for handling pre-signup users who have purchased artwork through Stripe, maintaining their transaction history until they create a full account.

## Directory Structure
```
mm-app/
├── lib/
│   ├── types/
│   │   └── ghost-profiles.ts    # Type definitions
│   ├── actions/
│   │   └── ghost-profiles.ts    # Server actions
│   └── stripe/
│       └── ghost-profiles-utils.ts # Stripe integration
├── app/
│   ├── api/
│   │   └── ghost-profiles/
│   │       ├── claim/
│   │       │   └── route.ts
│   │       └── webhook/
│   │           └── route.ts
│   └── (protected)/
│       └── admin/
│           └── ghost-profiles/
│               ├── page.tsx
│               └── settings.tsx  # Admin visibility settings
└── components/
    └── ghost-profiles/
        ├── claim-form.tsx
        ├── profile-list.tsx
        ├── visibility-toggle.tsx # Admin control for visibility
        └── transaction-history.tsx
```

## Type Definitions
```typescript
// lib/types/ghost-profiles.ts
interface GhostProfile {
  id: string
  email: string // protected
  stripeCustomerId: string
  isClaimed: boolean
  displayName: string // defaults to "Art Collector"
  createdAt: string
  updatedAt: string
  lastPurchaseDate: string
  totalPurchases: number
  totalSpent: number
  isVisible: boolean // Controls public visibility
  claimedProfileId?: string // Reference to claimed profile
  metadata: {
    isTest?: boolean
    environment?: string
  }
}

interface GhostProfileVisibility {
  showInGallery: boolean      // Show in artwork gallery
  showInArtistDashboard: boolean // Show in artist sales
  showInPublicStats: boolean  // Show in platform statistics
}

interface GhostTransaction {
  id: string
  object: 'payment_intent'
  amount: number
  currency: string
  customer: string
  created: number
  status: PaymentStatus
  metadata: TransactionMetadata
  charges: {
    data: Array<TransactionCharge>
  }
}

interface TransactionMetadata {
  artworkId: string
  artistId: string
  isTest?: string
  environment?: string
}

interface TransactionCharge {
  id: string
  amount: number
  created: number
  paymentMethodDetails: {
    card?: {
      brand: string
      last4: string
      expMonth: number
      expYear: number
    }
  }
}

type PaymentStatus = 
  | 'succeeded'
  | 'processing'
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'canceled'
```

## Implementation Steps

### 1. Database Schema
```sql
-- supabase/migrations/[timestamp]_ghost_profiles.sql

-- Create separate ghost profiles table
CREATE TABLE ghost_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  is_claimed BOOLEAN DEFAULT FALSE,
  display_name TEXT DEFAULT 'Art Collector',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  total_purchases INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT FALSE,
  claimed_profile_id UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT unique_email UNIQUE(email),
  CONSTRAINT unique_stripe_customer UNIQUE(stripe_customer_id)
);

-- Create stripe transactions table
CREATE TABLE stripe_transactions (
  -- Internal fields
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID REFERENCES artworks(id),
  buyer_id UUID REFERENCES profiles(id),
  ghost_profile_id UUID REFERENCES ghost_profiles(id),
  
  -- Stripe PaymentIntent fields
  stripe_payment_intent_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  amount_received INTEGER,
  currency TEXT NOT NULL DEFAULT 'usd',
  payment_status TEXT NOT NULL,
  payment_intent_status TEXT NOT NULL,
  capture_method TEXT,
  client_secret TEXT,
  confirmation_method TEXT,
  description TEXT,
  invoice_id TEXT,
  statement_descriptor TEXT,
  statement_descriptor_suffix TEXT,

  -- Payment method details
  payment_method_id TEXT,
  payment_method_types TEXT[],
  payment_method_details JSONB,
  
  -- Card details (if payment method is card)
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_country TEXT,
  
  -- Timestamps from Stripe
  stripe_created TIMESTAMP WITH TIME ZONE,
  stripe_canceled_at TIMESTAMP WITH TIME ZONE,
  stripe_processing_at TIMESTAMP WITH TIME ZONE,
  stripe_succeeded_at TIMESTAMP WITH TIME ZONE,
  
  -- Internal timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  error_code TEXT,
  last_payment_error JSONB,

  CONSTRAINT unique_payment_intent UNIQUE(stripe_payment_intent_id)
);

-- Add transaction status enum
CREATE TYPE payment_status AS ENUM (
  'succeeded',
  'processing',
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
  'canceled'
);

-- Add transaction status check
ALTER TABLE stripe_transactions 
  ADD CONSTRAINT valid_payment_status 
  CHECK (payment_status::text::payment_status IS NOT NULL);

-- Add indexes for performance
CREATE INDEX idx_ghost_profiles_email ON ghost_profiles(email);
CREATE INDEX idx_ghost_profiles_stripe_customer ON ghost_profiles(stripe_customer_id);
CREATE INDEX idx_ghost_profiles_is_visible ON ghost_profiles(is_visible) WHERE is_visible = TRUE;

CREATE INDEX idx_stripe_transactions_customer ON stripe_transactions(stripe_customer_id);
CREATE INDEX idx_stripe_transactions_artwork ON stripe_transactions(artwork_id);
CREATE INDEX idx_stripe_transactions_buyer ON stripe_transactions(buyer_id);
CREATE INDEX idx_stripe_transactions_ghost ON stripe_transactions(ghost_profile_id);
CREATE INDEX idx_stripe_transactions_created ON stripe_transactions(created_at DESC);
CREATE INDEX idx_stripe_transactions_payment_status ON stripe_transactions(payment_status);
CREATE INDEX idx_stripe_transactions_stripe_created ON stripe_transactions(stripe_created DESC);

-- Update types to match schema
```typescript
interface StripeTransaction {
  // Internal fields
  id: string
  artworkId: string
  buyerId?: string
  ghostProfileId?: string
  
  // Stripe PaymentIntent fields
  stripePaymentIntentId: string
  stripeCustomerId: string
  amount: number
  amountReceived?: number
  currency: string
  paymentStatus: PaymentStatus
  paymentIntentStatus: string
  captureMethod?: string
  clientSecret?: string
  confirmationMethod?: string
  description?: string
  invoiceId?: string
  statementDescriptor?: string
  statementDescriptorSuffix?: string

  // Payment method details
  paymentMethodId?: string
  paymentMethodTypes: string[]
  paymentMethodDetails?: {
    type: string
    card?: {
      brand: string
      last4: string
      expMonth: number
      expYear: number
      country: string
    }
  }
  
  // Timestamps
  stripeCreated: string
  stripeCanceledAt?: string
  stripeProcessingAt?: string
  stripeSucceededAt?: string
  createdAt: string
  updatedAt: string
  
  // Additional data
  metadata: {
    isTest?: boolean
    environment?: string
    [key: string]: any
  }
  errorMessage?: string
  errorCode?: string
  lastPaymentError?: any
}

type PaymentStatus = 
  | 'succeeded'
  | 'processing'
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'canceled'
```

The updated schema:
1. Matches Stripe's PaymentIntent fields exactly
2. Includes all relevant payment method details
3. Tracks multiple status timestamps
4. Stores error information
5. Uses proper data types for each field
6. Adds appropriate constraints and indexes

This will help us:
1. Maintain complete payment history
2. Track payment lifecycle
3. Handle errors properly
4. Support refunds and disputes
5. Generate accurate reports
```

### 2. Server Actions
```typescript
// lib/actions/ghost-profiles.ts
import { createActionClient } from '@/lib/supabase/supabase-action'
import { stripe } from '@/lib/stripe/stripe-server-utils'
import type { 
  GhostProfile, 
  GhostTransaction,
  GhostProfileVisibility 
} from '@/lib/types/ghost-profiles'

export async function createGhostProfile(transaction: GhostTransaction) {
  const supabase = await createActionClient()
  // Implementation...
}

export async function updateVisibilitySettings(
  settings: GhostProfileVisibility
) {
  const supabase = await createActionClient()
  // Implementation...
}

export async function toggleProfileVisibility(
  profileId: string,
  isVisible: boolean
) {
  const supabase = await createActionClient()
  // Implementation...
}

// ... rest of existing actions ...
```

### 3. Admin Components
```typescript
// components/ghost-profiles/visibility-toggle.tsx
interface VisibilityToggleProps {
  settings: GhostProfileVisibility
  onUpdate: (settings: GhostProfileVisibility) => Promise<void>
}

export function VisibilityToggle({ settings, onUpdate }: VisibilityToggleProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="showInGallery">Show in Artwork Gallery</Label>
        <Switch
          id="showInGallery"
          checked={settings.showInGallery}
          onCheckedChange={(checked) => 
            onUpdate({ ...settings, showInGallery: checked })
          }
        />
      </div>
      {/* Add other visibility toggles */}
    </div>
  )
}
```

### 4. Query Utilities
```typescript
// lib/utils/ghost-profile-utils.ts
export function getVisibilityFilter(settings: GhostProfileVisibility) {
  return {
    is_visible: true,
    ...(settings.showInGallery && { show_in_gallery: true }),
    ...(settings.showInArtistDashboard && { show_in_artist_dashboard: true }),
    ...(settings.showInPublicStats && { show_in_public_stats: true })
  }
}
```

## Security Measures
1. Data Protection:
   - Email addresses encrypted at rest
   - Stripe customer IDs stored securely
   - Transaction data access logged
   - Visibility settings changes are audited

2. Access Control:
   - Admin-only access to full profiles
   - Artist access to anonymized data based on visibility settings
   - Rate limiting on claim attempts
   - Visibility changes restricted to admin role

3. Validation:
   - Email verification required
   - Strong password requirements
   - Webhook signature verification
   - Visibility setting changes validated

## Testing Strategy
1. Unit Tests:
   ```typescript
   // __tests__/ghost-profiles/actions.test.ts
   import { createGhostProfile, claimGhostProfile } from '@/lib/actions/ghost-profiles'
   
   describe('Ghost Profile Actions', () => {
     // Test implementations...
   })
   ```

2. Integration Tests:
   ```typescript
   // __tests__/ghost-profiles/api.test.ts
   import { stripe } from '@/lib/stripe/stripe-server-utils'
   
   describe('Ghost Profile API', () => {
     // Test implementations...
   })
   ```

## Monitoring
1. Error Tracking:
   - Log failed claim attempts
   - Monitor webhook failures
   - Track merge conflicts

2. Analytics:
   - Ghost profile creation rate
   - Claim success rate
   - Average time to claim
``` 