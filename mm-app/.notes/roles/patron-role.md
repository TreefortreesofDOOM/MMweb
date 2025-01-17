# Patron Role Documentation

## Overview

The patron role encompasses users who collect and purchase artwork through the platform. This document outlines the key components and flows related to patron functionality, with special focus on ghost profiles, collections, and transactions.

## Physical Gallery Purchase Flow

1. Customer purchases artwork from verified artist at physical gallery via Stripe.
    - All past products and transactions are already stored in the database.
    - All of our Stripe Connect accounts are already verified_artist users connected to our database.
2. Stripe webhook sends transaction details to our webhook endpoint
3. Server logic determines transaction source:
   - Existing user
   - Existing ghost profile 
   - New customer (no profile)

### Transaction Processing

The transaction processing flow follows TypeScript-first, secure patterns with proper error handling and type safety.

#### For Existing User
```typescript
interface UserPurchaseData {
  userId: string;
  artworkId: string;
  stripePaymentIntentId: string;
  amount: {
    total: number;
    artistAmount: number;
    platformFee: number;
  };
  paymentDetails: {
    status: Database['public']['Enums']['payment_status'];
    billingEmail: string;
    billingName: string;
  };
}

async function processUserPurchase(data: UserPurchaseData) {
  // 1. Create transaction record
  const transaction = await createTransaction({
    buyer_id: data.userId,
    artwork_id: data.artworkId,
    stripe_payment_intent_id: data.stripePaymentIntentId,
    amount_total: data.amount.total,
    artist_amount: data.amount.artistAmount,
    platform_fee: data.amount.platformFee,
    status: data.paymentDetails.status,
    billing_email: data.paymentDetails.billingEmail,
    billing_name: data.paymentDetails.billingName,
    is_gallery_entry: true
  });

  // 2. Create or get "Purchased Works" collection
  const collection = await getOrCreatePurchasedCollection(data.userId);

  // 3. Add artwork to collection with transaction reference
  await addToCollection({
    collectionId: collection.id,
    artworkId: data.artworkId,
    transactionId: transaction.id,
    notes: `Purchased at gallery on ${new Date().toLocaleDateString()}`
  });

  // 4. Update user's purchase statistics
  await updateUserPurchaseStats(data.userId);
}
```

#### For Non-Existing User (Ghost Profile)
```typescript
interface GuestPurchaseData {
  email: string;
  stripeCustomerId: string;
  artworkId: string;
  stripePaymentIntentId: string;
  amount: {
    total: number;
    artistAmount: number;
    platformFee: number;
  };
  paymentDetails: {
    status: Database['public']['Enums']['payment_status'];
    billingEmail: string;
    billingName: string;
  };
}

async function processGuestPurchase(data: GuestPurchaseData) {
  // 1. Check for existing ghost profile
  let ghostProfile = await getGhostProfileByEmail(data.email);

  // 2. Create ghost profile if doesn't exist
  if (!ghostProfile) {
    ghostProfile = await createGhostProfile(
      data.email,
      data.stripeCustomerId,
      {
        source: 'gallery_purchase',
        first_purchase_date: new Date().toISOString()
      }
    );
  }

  // 3. Create transaction record with ghost profile reference
  const transaction = await createTransaction({
    ghost_profile_id: ghostProfile.id,
    artwork_id: data.artworkId,
    stripe_payment_intent_id: data.stripePaymentIntentId,
    amount_total: data.amount.total,
    artist_amount: data.amount.artistAmount,
    platform_fee: data.amount.platformFee,
    status: data.paymentDetails.status,
    billing_email: data.email,
    billing_name: data.paymentDetails.billingName,
    is_gallery_entry: true,
    metadata: {
      purchase_date: new Date().toISOString(),
      source: 'gallery_purchase'
    }
  });

  // 4. Update ghost profile statistics
  await updateGhostProfile(ghostProfile.id, {
    totalPurchases: ghostProfile.totalPurchases + 1,
    totalSpent: ghostProfile.totalSpent + data.amount.total,
    lastPurchaseDate: new Date().toISOString()
  });

  return {
    ghostProfile,
    transaction
  };
}
```

### Ghost Profile Claiming Process
```typescript
async function claimGhostProfile(ghostProfileId: string, userId: string) {
  // 1. Get ghost profile data and verify
  const ghostProfile = await getGhostProfile(ghostProfileId);
  if (!ghostProfile) throw new Error('Ghost profile not found');

  // 2. Update ghost profile
  await updateGhostProfile(ghostProfileId, {
    isClaimed: true,
    claimedProfileId: userId,
    metadata: {
      claimed_at: new Date().toISOString()
    }
  });

  // 3. Update transactions with hybrid approach
  await updateTransactions(ghostProfileId, userId);

  // 4. Create purchased works collection
  const collection = await createPurchasedCollection(userId);

  // 5. Add all purchased artworks to collection
  await addPurchasedArtworksToCollection(collection.id, ghostProfileId);

  // 6. Update user profile with ghost profile data
  await updateUserProfile(userId, {
    totalPurchases: ghostProfile.totalPurchases,
    totalSpent: ghostProfile.totalSpent,
    ghostProfileClaimed: true,
    lastPurchaseDate: ghostProfile.lastPurchaseDate
  });
}
```

### Transaction Record States

1. **Before Claiming**:
```typescript
{
  id: "tx_123",
  ghost_profile_id: "ghost_456",
  buyer_id: null,
  // ... other fields
}
```

2. **After Claiming**:
```typescript
{
  id: "tx_123",
  ghost_profile_id: "ghost_456", // Maintain historical reference
  buyer_id: "user_789",          // Add new owner
  metadata: {
    claimed_at: "2024-01-06T...",
    original_ghost_profile_id: "ghost_456"
  }
  // ... other fields
}
```

### Benefits of Hybrid Approach

1. **Data Integrity**:
   - Maintains complete history
   - Preserves ghost profile relationship
   - Adds explicit claiming audit trail

2. **Query Performance**:
   - Direct user ID lookup available
   - Historical queries still possible
   - No complex joins needed for basic access

3. **Analytics Benefits**:
   - Track ghost-to-user conversion
   - Measure time-to-claim metrics
   - Analyze purchasing patterns

4. **Security**:
   - RLS policies remain unchanged
   - Clear ownership transition
   - Fraud prevention capabilities

## Collection Management

### Collection Types
1. **Purchased Works Collection**:
   - Created only when ghost profile is claimed or user makes first purchase
   - Cannot be modified/deleted
   - Contains all purchased artworks with transaction references
   - Automatically updated with new purchases

2. **Custom Collections**:
   - Created by users
   - Can be modified/deleted
   - Support custom notes and ordering
   - Can be public or private

### Collection Creation Flow
1. **For Direct User Purchases**:
   - Collection created immediately
   - Artwork added with transaction reference
   - Purchase metadata stored

2. **For Ghost Profile Purchases**:
   - No collection created initially
   - Collection created upon profile claiming
   - All purchased artworks added at once
   - Transaction references maintained

### Collection Access Control
1. **RLS Policies**:
   - Users can only access their own collections
   - Ghost profile collections accessible after claiming
   - Public collections visible to all
   - Private collections only visible to owner

2. **Modification Rules**:
   - Purchased collections cannot be modified
   - Custom collections fully editable
   - Ghost profile collections locked until claimed

## Security and Access Control

### RLS Policies
1. Ghost Profiles
   - Users can only claim their own ghost profiles (by email)
   - Ghost profiles are only visible to admins and the claiming user

2. Collections
   - Users can view their own collections and public collections
   - Private collections are only visible to owners
   - Purchased collections cannot be modified/deleted

3. Transactions
   - Users can view their own transactions
   - Artists can view transactions for their artworks
   - Ghost profile transactions are protected until claimed

### Analytics & Tracking

1. Collection Analytics
   - View counts
   - Unique visitors
   - Traffic sources
   - Last 30 days activity

2. Purchase Tracking
   - Total purchases
   - Total spent
   - Purchase history
   - Transaction status

3. Social Interactions
   - Following artists
   - Favoriting artworks
   - Collection sharing

4. Profile Completion
   - Field completion tracking
   - Profile verification status
   - Community engagement metrics

