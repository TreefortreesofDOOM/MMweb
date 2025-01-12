# Stripe Store Implementation Plan

## Implementation Preferences
- **General Notes**
    - Follow @.cursorrules
    
### Payment Processing
- **Stripe Checkout**: Using Stripe's hosted checkout page for:
  - Pre-built responsive UI
  - Built-in address collection
  - Mobile-optimized experience
  - Automatic card validation
  - Support for multiple payment methods

### Connect Integration
- **Destination Charges**: Using destination charges because:
  - Charges processed on platform account
  - Automatic transfer to artist accounts
  - Platform handles Stripe fees
  - Better control over payment flow
  - Simpler refund handling with transfer reversals

### Product Management
- **Platform-Owned Products**: All products created on platform account:
  - Centralized product catalog
  - Consistent product management
  - Better inventory tracking
  - Simplified price management
  - Platform maintains control over listings

- **Artist Access**: Any verified artist can:
  - Create store products from their uploaded artworks
  - No gallery approval required
  - Manage their own product listings
  - Set pricing and product options

### Fee Handling
- **Application Fees**: Using Stripe's built-in application fees because:
  - Automatic fee calculation and splitting
  - Transparent fee reporting
  - Built-in refund handling
  - Clear separation in financial reporting

### Product Types
- **Fixed Price**: Standard artwork sales
  - Product and price on platform account
  - Direct transfer to artist account via destination charge
  - Automatic fee handling
  - Uses destination charges
- **Variable Price**: Trust Wall artwork
  - Product and price on platform account
  - Collected to platform account
  - Manual transfer to artist
  - Custom price input by customer

## Overview
Implementation of the Stripe store system for artists to create and manage products on the platform using the existing Stripe Connect Express integration.

## Database Schema

### Tables

1. `store_products`
   ```sql
   create table store_products (
     id uuid primary key default uuid_generate_v4(),
     profile_id uuid references profiles(id) on delete cascade,
     artwork_id uuid references artworks(id) on delete cascade,
     stripe_product_id text unique,
     stripe_price_id text,
     is_variable_price boolean default false,
     min_price decimal,
     status text not null default 'draft',
     metadata jsonb,
     created_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now()
   );
   ```

2. `store_settings`
   ```sql
   create table store_settings (
     profile_id uuid primary key references profiles(id) on delete cascade,
     stripe_account_id text unique,
     is_stripe_enabled boolean default false,
     application_fee_percent decimal not null default 10.0,
     metadata jsonb,
     created_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now()
   );
   ```

### Functions

1. Create store product:
   ```sql
   create or replace function create_store_product(
     _profile_id uuid,
     _artwork_id uuid,
     _stripe_product_id text,
     _stripe_price_id text,
     _is_variable_price boolean default false,
     _min_price decimal default null
   ) returns store_products as $$
   declare
     _product store_products;
   begin
     -- Verify the artwork belongs to the artist
     if not exists (
       select 1 from artworks
       where id = _artwork_id
       and artist_id = _profile_id
     ) then
       raise exception 'Artwork does not belong to artist';
     end if;

     insert into store_products (
       profile_id,
       artwork_id,
       stripe_product_id,
       stripe_price_id,
       is_variable_price,
       min_price
     )
     values (
       _profile_id,
       _artwork_id,
       _stripe_product_id,
       _stripe_price_id,
       _is_variable_price,
       _min_price
     )
     returning * into _product;

     return _product;
   end;
   $$ language plpgsql security definer;
   ```

### RLS Policies

1. `store_products`
   ```sql
   -- Allow users to view products
   create policy "Anyone can view products"
   on store_products for select
   using (true);

   -- Allow verified artists to manage their own products
   create policy "Verified artists can manage their own products"
   on store_products for all
   using (
     auth.uid() = profile_id
     and exists (
       select 1 from profile_roles
       where profile_id = auth.uid()
       and role = 'verified_artist'
     )
   );

   -- Allow admins to manage all products
   create policy "Admins can manage all products"
   on store_products for all
   using (
     exists (
       select 1 from profile_roles
       where profile_id = auth.uid()
       and role = 'admin'
     )
   );
   ```

## Implementation Steps

### 1. Database Setup
- [ ] Create store_products table with artwork reference
- [ ] Create store_settings table
- [ ] Add RLS policies for verified artists
- [ ] Create helper functions

### 2. Product Management
- [ ] Create product creation endpoint
  ```typescript
  // Example product creation with Stripe using artwork data
  const createStripeProduct = async (artwork) => {
    // Create product on platform account using artwork data
    const product = await stripe.products.create({
      name: artwork.title,
      description: artwork.description,
      images: artwork.images.map(img => img.url),
      active: true,
      metadata: {
        artwork_id: artwork.id,
        artist_id: artwork.artist_id,
        environment: process.env.NODE_ENV
      },
      tax_code: 'txcd_10103001', // Fine art tax code
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/artwork/${artwork.id}`,
    });

    // Create price based on product type
    if (artwork.is_variable_price) {
      const price = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        custom_unit_amount: {
          enabled: true,
          minimum: artwork.min_price * 100,
        }
      });
    } else {
      const price = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: artwork.price * 100,
      });
    }
  };
  ```

### 3. Frontend Components
- [ ] Create `ArtworkProductList` component
  - Display artist's artworks with option to add to store
  - Show existing store status for each artwork
  - Quick actions (add to store, edit store settings)

- [ ] Create `ArtworkProductForm` component
  - Display artwork details (title, description, images)
  - Allow setting store-specific options:
    - Fixed/Variable pricing
    - Minimum price for variable pricing
    - Active status

- [ ] Create `StoreSettings` component
  - Application fee display
  - Stripe account status
  - Payout schedule info
  - Store metrics/analytics

### 4. Payment Flow

1. **Checkout Flow**
   ```typescript
   // Create checkout session for fixed price product
   const createCheckoutSession = async (product: StoreProduct) => {
     const session = await stripe.checkout.sessions.create({
       mode: 'payment',
       success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/success?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/cancel`,
       payment_intent_data: {
         application_fee_amount: calculateApplicationFee(product.price),
         transfer_data: {
           destination: product.store_settings.stripe_account_id,
         },
       },
       line_items: [{
         price: product.stripe_price_id,
         quantity: 1,
       }],
       shipping_address_collection: {
         allowed_countries: ['US'],
       },
       billing_address_collection: 'required',
       payment_method_types: ['card'],
       metadata: {
         product_id: product.id,
         artwork_id: product.artwork_id,
         artist_id: product.profile_id,
       },
     });
     return session;
   };

   // Create checkout session for variable price product
   const createTrustWallCheckoutSession = async (product: StoreProduct, amount: number) => {
     // Validate minimum price
     if (amount < product.min_price) {
       throw new Error('Amount is below minimum price');
     }

     const session = await stripe.checkout.sessions.create({
       mode: 'payment',
       success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/success?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/cancel`,
       line_items: [{
         price_data: {
           currency: 'usd',
           unit_amount: amount * 100,
           product: product.stripe_product_id,
         },
         quantity: 1,
       }],
       shipping_address_collection: {
         allowed_countries: ['US'],
       },
       billing_address_collection: 'required',
       payment_method_types: ['card'],
       metadata: {
         product_id: product.id,
         artwork_id: product.artwork_id,
         artist_id: product.profile_id,
         amount: amount,
         is_variable_price: true, // Flag for webhook to handle manual transfer
       },
     });
     return session;
   };
   ```

2. **Webhook Handling**
   ```typescript
   // Handle checkout session completed
   const handleCheckoutSessionCompleted = async (event) => {
     const session = event.data.object;
     
     // Update order status
     await db.from('store_orders').update({
       status: 'completed',
       stripe_payment_intent: session.payment_intent,
       shipping_details: session.shipping_details,
       customer_details: session.customer_details,
     }).match({ id: session.metadata.order_id });

     // Handle different payment types
     if (session.metadata.is_variable_price) {
       // Queue manual transfer to artist
       await createArtistPayout({
         artistId: session.metadata.artist_id,
         amount: calculateArtistShare(session.amount_total),
         sessionId: session.id,
         productId: session.metadata.product_id
       });
     }

     // Send confirmation emails
     await sendOrderConfirmationEmail(session);
     await sendArtistNotificationEmail(session);
   };

   // Handle payment failed
   const handlePaymentFailed = async (event) => {
     const session = event.data.object;
     
     await db.from('store_orders').update({
       status: 'failed',
       error_message: session.last_payment_error?.message,
     }).match({ id: session.metadata.order_id });
   };
   ```

3. **Frontend Integration**
   ```typescript
   // Checkout button component
   const CheckoutButton = ({ product }: { product: StoreProduct }) => {
     const handleCheckout = async () => {
       try {
         const response = await fetch('/api/store/checkout', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ productId: product.id }),
         });
         
         const { sessionId } = await response.json();
         const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
         
         await stripe.redirectToCheckout({ sessionId });
       } catch (error) {
         console.error('Error:', error);
         toast.error('Failed to initiate checkout');
       }
     };

     return (
       <Button onClick={handleCheckout}>
         Purchase
       </Button>
     );
   };

   // Trust wall checkout component
   const TrustWallCheckout = ({ product }: { product: StoreProduct }) => {
     const [amount, setAmount] = useState(product.min_price);
     
     const handleCheckout = async () => {
       try {
         const response = await fetch('/api/store/checkout/trust-wall', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ 
             productId: product.id,
             amount,
           }),
         });
         
         const { sessionId } = await response.json();
         const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
         
         await stripe.redirectToCheckout({ sessionId });
       } catch (error) {
         console.error('Error:', error);
         toast.error('Failed to initiate checkout');
       }
     };

     return (
       <div>
         <Input
           type="number"
           min={product.min_price}
           step="0.01"
           value={amount}
           onChange={(e) => setAmount(parseFloat(e.target.value))}
         />
         <Button onClick={handleCheckout}>
           Purchase
         </Button>
       </div>
     );
   };
   ```

### Testing Requirements

1. **Product Management**
   - [ ] Test creating products from artworks
   - [ ] Verify store status updates
   - [ ] Test variable pricing settings

2. **Checkout Flow**
   - [ ] Test fixed price checkout
   - [ ] Test variable price checkout
   - [ ] Verify application fee calculations
   - [ ] Test shipping/billing info collection

3. **Webhooks**
   - [ ] Test successful payment handling
   - [ ] Test failed payment handling
   - [ ] Verify email notifications

4. **Error Handling**
   - [ ] Test invalid price inputs
   - [ ] Test checkout with invalid products
   - [ ] Verify error messages and UI feedback

### 5. Webhook Handling
- [ ] Set up webhook endpoints for Checkout events
  ```typescript
  // Handle successful payments
  const handleCheckoutSuccess = async (session) => {
    if (session.payment_intent_data?.transfer_data?.destination) {
      // Fixed price product - funds automatically transferred
      await updateProductSaleStatus(session);
    } else {
      // Variable price product - handle manual transfer
      await createArtistPayout({
        artistId: session.metadata.artist_id,
        amount: calculateArtistShare(session.amount_total),
        sessionId: session.id,
        productId: session.metadata.product_id
      });
    }
  };
  ```

### 6. Event Handling
- [ ] Handle required Checkout events:
  - [ ] `checkout.session.completed`
  - [ ] `checkout.session.async_payment_succeeded`
  - [ ] `checkout.session.async_payment_failed`
- [ ] Handle transfer events:
  - [ ] `transfer.created`
  - [ ] `transfer.failed`

### 7. Refund Handling
- [ ] Implement refund process with transfer reversal
  ```typescript
  const handleRefund = async (paymentIntent) => {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntent,
      reverse_transfer: true, // Pull funds back from connected account
      refund_application_fee: true // Refund our fee as well
    });
    return refund;
  };
  ```

### 8. Testing
- [ ] Test Checkout flow for fixed price products
  - [ ] Test successful payments with destination charges
  - [ ] Test application fee calculation
  - [ ] Test automatic transfers
- [ ] Test Checkout flow for variable price products
  - [ ] Test minimum price enforcement
  - [ ] Test manual payout process
- [ ] Test refund process
  - [ ] Test transfer reversals
  - [ ] Test application fee refunds

## Pricing Models

### Fixed Price Products
- Standard pricing set by artist
- Application fee automatically handled by Stripe Connect
- Direct payout to artist's connected account

### Variable Price Products (Trust Wall)
- Default minimum price $10 (artist can choose to set higher. We suggest between $10 - $30)
- Customer can choose amount above minimum
- Payment collected to platform account
- Manual calculation and payout of artist share
- Platform handles fee splitting and transfers

## Security Considerations
- Use Stripe's built-in fraud prevention
- Implement proper webhook signature verification
- Monitor transactions
- Ensure accurate fee calculations for manual payouts
- Verify webhook events before processing

## Deployment Checklist
- [ ] Set up Stripe webhook endpoints
- [ ] Configure webhook signing secrets
- [ ] Set up error monitoring
- [ ] Document API endpoints
- [ ] Monitor initial transactions
- [ ] Set up automated payout process for variable price products

## Frontend Implementation Plan

### Components Structure

1. **Store Management Page** (`/artist/store/page.tsx`)
   - Main dashboard for artists to manage their store products
   - Lists all artworks with store status
   - Quick actions to add/remove from store
   - Store analytics and earnings

2. **Product Management Components**
   - `ArtworkProductList`: Lists artist's artworks
     - Displays artwork thumbnail, title, price
     - Shows store status (not listed, active, inactive)
     - Quick actions (add to store, edit store settings)
   
   - `ArtworkProductForm`: Form to add artwork to store
     - Display artwork details (read-only):
       - Title
       - Description
       - Images
     - Store settings:
       - Variable pricing toggle
       - Minimum price for variable pricing
       - Active status

3. **Store Settings Components**
   - `StoreSettings`: Manage store configuration
     - Application fee display (read-only)
     - Stripe account status
     - Payout schedule info
     - Store metrics/analytics

4. **Checkout Components**
   - `CheckoutButton`: Initiates Stripe Checkout
     - Handles both fixed and variable price products
     - Collects shipping/billing info
     - Processes payments with destination charges

### State Management

```typescript
interface StoreProduct {
  id: string
  profile_id: string
  artwork_id: string
  is_variable_price: boolean
  min_price?: number
  stripe_product_id?: string
  stripe_price_id?: string
  status: 'draft' | 'active' | 'archived'
  metadata: Record<string, any>
}

interface ArtworkWithStore extends Database['public']['Tables']['artworks']['Row'] {
  store_product?: StoreProduct
}
```

### API Integration

1. **Product Management**
   ```typescript
   // Add artwork to store
   POST /api/store/products
   {
     artwork_id: string
     is_variable_price?: boolean
     min_price?: number
   }
   
   // List artworks with store status
   GET /api/store/products
   
   // Get store settings
   GET /api/store/settings
   ```

2. **Checkout Process**
   ```typescript
   // Create checkout session
   POST /api/store/checkout
   {
     product_id: string
     price?: number // For variable price products
   }
   ```

### Implementation Order

1. **Phase 1: Basic Structure**
   - Create store management page layout
   - Implement ArtworkProductList component
   - Add store settings view

2. **Phase 2: Product Management**
   - Build ArtworkProductForm component
   - Implement artwork to store product conversion
   - Add bulk actions

3. **Phase 3: Checkout Flow**
   - Implement CheckoutButton component
   - Add Stripe Checkout integration
   - Handle success/cancel flows

4. **Phase 4: Polish**
   - Add loading states
   - Implement error handling
   - Add success notifications
   - Optimize performance

### UI/UX Guidelines

1. **Loading States**
   - Skeleton loaders for lists
   - Disabled buttons during operations
   - Progress indicators for uploads

2. **Error Handling**
   - Clear error messages
   - Retry options where applicable
   - Validation feedback

3. **Responsive Design**
   - Mobile-first approach
   - Grid layout for product lists
   - Collapsible sections on mobile

4. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - High contrast mode support

### Testing Strategy

1. **Unit Tests**
   - Component rendering
   - Form validation
   - State management

2. **Integration Tests**
   - API interactions
   - Checkout flow
   - Error scenarios

3. **E2E Tests**
   - Complete purchase flow
   - Store management workflows
   - Settings updates

### Dependencies

- shadcn/ui components
- react-hook-form
- zod for validation
- @stripe/stripe-js
- TailwindCSS for styling