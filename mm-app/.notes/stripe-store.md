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

## Implementation Steps

### 1. Database Setup [COMPLETED]
- [x] Create store_products table with artwork reference
- [x] Create store_settings table
- [x] Add RLS policies for verified artists
- [x] Create helper functions
- [x] Add payment_link column
- [x] Add stripe_product_metadata for inventory tracking

### 2. Product Management [IN PROGRESS]
- [x] Create product creation endpoint
- [x] Set up Stripe product creation
- [x] Handle variable price products
- [x] Create payment links with destination charges
- [x] Add inventory tracking via Stripe metadata
- [ ] Implement product status updates (archive/unarchive)
- [ ] Add product deletion with Stripe cleanup (admin only)

### 3. Frontend Components [IN PROGRESS]
- [x] Create Store Management Page
  - [x] Basic structure and routing
  - [x] Authentication and role checks
  - [x] Store settings display
- [x] Create Product List component
  - [x] Display artist's artworks with option to add to store
  - [x] Show existing store status for each artwork
  - [x] Quick actions (add to store, edit store settings)
  - [x] Show inventory status (available/sold)
- [x] Create Product Form component
  - [x] Display artwork details
  - [x] Allow setting store-specific options
  - [x] Handle fixed/variable pricing
  - [x] Add inventory type and quantity fields
- [x] Create Store Settings component
  - [x] Application fee display
  - [x] Stripe account status
  - [x] Payout schedule info

### 4. Payment Flow [IN PROGRESS]
- [x] Add payment_link column to store_products table
- [x] Update product creation to generate Payment Link
- [x] Add "Buy Now" button that links to Payment Link URL
  - [x] Disable button when sold out
  - [x] Show "Sold" status
- [x] Create success and cancel pages
  - [x] Add session verification
  - [x] Handle error states
- [x] Use Stripe Checkout for automatic payment handling
- [ ] Send confirmation emails

### 5. Webhook Handling [IN PROGRESS]
- [x] Set up single webhook endpoint for checkout events
- [x] Handle `checkout.session.completed` event
  - [x] Update inventory status
  - [ ] Send confirmation emails
  - [x] Handle sold out status
- [x] Verify webhook signatures
- [x] Add basic error handling
- [ ] Add webhook monitoring in production

### 6. Event Handling [REMOVED]
- Handled automatically by Stripe Checkout

### 7. Refund Handling [REMOVED]
- Handled through Stripe Dashboard
- Automatic fee refund handling
- Automatic transfer reversal

### 8. Testing [IN PROGRESS]
- [x] Test database setup and RLS policies
- [x] Test store management page authentication
- [x] Test product management
- [x] Test Payment Link creation
- [ ] Test webhook handling

## Frontend Implementation Plan [IN PROGRESS]

### Components Structure [COMPLETED]
- [x] Store Management Page (`/artist/store/page.tsx`)
- [x] Product Management Components
- [x] Store Settings Components
- [x] Buy Now Button Component

### API Integration [IN PROGRESS]
- [x] Product Management endpoints
- [x] Store Settings endpoints
- [ ] Basic webhook endpoint

### Implementation Order
1. **Phase 1: Basic Structure** [COMPLETED]
   - [x] Store management page layout
   - [x] ArtworkProductList component
   - [x] Store settings view

2. **Phase 2: Product Management** [COMPLETED]
   - [x] ArtworkProductForm component
   - [x] Artwork to store product conversion
   - [x] Bulk actions

3. **Phase 3: Checkout Flow** [IN PROGRESS]
   - [x] Add Payment Link to product creation
   - [x] Add Buy Now button component
   - [x] Create success/cancel pages
   - [ ] Set up webhook handling

4. **Phase 4: Polish** [IN PROGRESS]
   - [x] Loading states
   - [x] Error handling
   - [x] Success notifications
   - [ ] Performance optimization

## Deployment Checklist [NOT STARTED]
- [ ] Set up Stripe webhook endpoint with signature verification
- [ ] Configure success/cancel URLs in Stripe Dashboard
- [ ] Set up basic error monitoring
- [ ] Document API endpoints
- [ ] Test with Stripe test cards