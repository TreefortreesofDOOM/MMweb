

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

#### For Existing User
- Add transaction to database
- Automatically add artwork to user's "Purchased Works" collection

#### For Non-Existing User
1. Check for related ghost account
2. If ghost account exists:
   - Add transaction to database.
   - Add artwork to ghost account's "Purchased Works" collection.
3. If no ghost account:
   - Create new ghost profile
   - Process transaction.
   - Create "Purchased Works" collection for ghost profile.

## Data Model and Relationships

### 1. Ghost Profiles
```typescript
interface GhostProfile {
  id: string
  email: string
  stripe_customer_id: string
  claimed_profile_id?: string  // Link to real user when claimed
  is_claimed: boolean
  is_visible: boolean
  created_at: Date
  updated_at: Date
}
```
Purpose:
- Represents customers who purchased art but don't have an account
- Can be claimed by a real user later
- Maintains purchase history before account creation

### 2. Collections
```typescript
interface Collection {
  id: string
  name: string
  description?: string
  patron_id?: string          // For registered users
  ghost_profile_id?: string   // For ghost profiles
  is_purchased: boolean       // True for "Purchased Works"
  is_private: boolean
  created_at: Date
  updated_at: Date
}
```
Key Points:
- Must have either patron_id OR ghost_profile_id (not both)
- "Purchased Works" collection is special (is_purchased = true)
- Can't modify/delete purchased collections

### 3. Transactions
```typescript
interface Transaction {
  id: string
  stripe_payment_intent_id: string
  amount_total: number
  status: string
  artwork_id: string
  buyer_id?: string          // For registered users
  ghost_profile_id?: string  // For ghost profiles
  artist_id: string
  created_at: Date
  updated_at: Date
}
```
Key Points:
- Links artwork purchase to either buyer_id OR ghost_profile_id
- Used to track purchase history
- Connected to collection items in "Purchased Works"

### 4. Collection Items
```typescript
interface CollectionItem {
  collection_id: string
  artwork_id: string
  transaction_id?: string     // For purchased works
  notes?: string
  display_order: number
  added_at: Date
}
```
Key Points:
- transaction_id only set for purchased works
- Maintains order for display
- Links artworks to collections

## Flow Scenarios

### 1. New Purchase by Guest
```typescript
async function handleNewGuestPurchase(email: string, stripeData: any) {
  // 1. Create or get ghost profile
  const ghostProfile = await getOrCreateGhostProfile(email)
  
  // 2. Create transaction
  const transaction = await createTransaction({
    ghost_profile_id: ghostProfile.id,
    ...stripeData
  })
  
  // 3. Get or create "Purchased Works" collection
  const collection = await getOrCreatePurchasedCollection(ghostProfile.id)
  
  // 4. Add artwork to collection with transaction reference
  await addToCollection(collection.id, transaction.artwork_id, transaction.id)
}
```

### 2. Existing User Purchase
```typescript
async function handleUserPurchase(userId: string, stripeData: any) {
  // 1. Create transaction
  const transaction = await createTransaction({
    buyer_id: userId,
    ...stripeData
  })
  
  // 2. Get or create "Purchased Works" collection
  const collection = await getOrCreatePurchasedCollection(userId)
  
  // 3. Add artwork to collection with transaction reference
  await addToCollection(collection.id, transaction.artwork_id, transaction.id)
}
```

### 3. Ghost Profile Claiming
```typescript
async function claimGhostProfile(ghostProfileId: string, userId: string) {
  // 1. Update ghost profile
  await updateGhostProfile(ghostProfileId, {
    claimed_profile_id: userId,
    is_claimed: true
  })
  
  // 2. Update transactions
  await updateTransactions(ghostProfileId, userId)
  
  // 3. Transfer collections to user
  await transferCollections(ghostProfileId, userId)
}

