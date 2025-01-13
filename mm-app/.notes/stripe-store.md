# Stripe Store Implementation Guide

## Overview
The Stripe integration enables artists to sell their artwork through our platform using Stripe's hosted checkout and Connect platform. This document outlines the implementation details and architecture decisions.

## Architecture Decisions
    
### Payment Processing
- **Stripe Checkout**: Hosted checkout page implementation
  - Pre-built responsive UI with mobile optimization
  - Secure payment processing and address collection
  - Multiple payment method support
  - Automatic card validation

### Connect Integration
- **Destination Charges**: Platform-managed payment flow
  - All charges processed through platform account
  - Automatic transfer to connected artist accounts
  - Platform handles Stripe fees
  - Built-in refund handling with transfer reversals

### Product Management
- **Platform-Owned Products**: Centralized product catalog
  - All products created and managed on platform account
  - Inventory tracking via Stripe metadata
  - Unified price management system
  - Platform maintains control over listings

- **Wall Type Integration**: Gallery-specific pricing models
  - Trust Wall: Variable pricing with minimum price
    - Artists set minimum acceptable price
    - Optional recommended price guidance
    - Buyers can pay above minimum price
    - Stripe Connect handles variable amounts
  - Other Walls: Fixed price model
    - Standard fixed price using `gallery_price`
    - Direct price display and checkout
  - Metadata synced to Stripe products:
    ```typescript
    metadata: {
      wall_type: gallery_wall_type,
      is_variable_price: boolean,
      min_price?: number,
      recommended_price?: number
    }
    ```

### Fee Structure
- **Application Fees**: Automated fee handling
  - Configurable platform fee percentage
  - Automatic fee calculation and splitting
  - Transparent fee reporting in Stripe Dashboard
  - Built-in refund handling for fees

## Implementation Details

### Database Schema
- **store_products**
  - Links artwork to Stripe products
  - Tracks inventory and payment link status
  - RLS policies restrict access to artwork owners
  - Columns:
    - id: UUID (Primary Key)
    - artwork_id: UUID (Foreign Key)
    - stripe_product_id: String
    - payment_link_id: String
    - payment_link_status: String ('active', 'inactive', 'archived')
    - is_variable_price: Boolean
    - min_price: Decimal (required for Trust Wall)
    - gallery_price: Decimal (required for fixed price)
    - metadata: JSONB (wall type, recommended price)
    - inventory_type: Enum ('unlimited', 'finite')
    - inventory_quantity: Integer
    - status: Enum ('active', 'sold', 'archived')
    - created_at: Timestamp
    - updated_at: Timestamp

### API Endpoints

#### Store Management
- `POST /api/store/products`
  - Creates new store product
  - Generates Stripe product and payment link
  - Updates database with Stripe IDs
  
- `GET /api/store/products`
  - Lists artist's store products
  - Includes inventory and payment status
  
- `PATCH /api/store/products/[id]`
  - Updates product details
  - Syncs changes with Stripe

#### Checkout Flow
- `POST /api/store/checkout`
  - Creates Stripe Checkout session
  - Handles destination charge setup
  
- `POST /api/webhooks/stripe`
  - Processes Stripe webhook events
  - Updates inventory and order status
  - Handles checkout completion

### Frontend Components

#### Store Management
- `store-management-client.tsx`
  - Main store dashboard component
  - Displays product list and store settings
  - Handles bulk actions

- `artwork-product-list.tsx`
  - Lists artist's artworks with store status
  - Provides quick actions for store management
  - Shows inventory status

- `product-form.tsx`
  - Product creation/edit form
  - Handles pricing and inventory settings
  - Validates store requirements

#### Checkout Flow
- `checkout-status.tsx`
  - Displays checkout success/cancel status
  - Verifies session completion
  - Shows order confirmation

### Webhook Implementation
- Single endpoint handles all Stripe events
- Processes `checkout.session.completed`:
  - Updates inventory
  - Marks products as sold when inventory depleted
  - Records successful payment
- Verifies webhook signatures for security
- Implements idempotency handling

### Error Handling
- Comprehensive error states in UI
- Stripe error code mapping
- Webhook retry mechanism
- Transaction rollback on failures

## Development Setup

### Environment Variables
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_ACCOUNT=acct_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Testing
- Use Stripe test mode for development
- Test cards available in Stripe docs
- Webhook testing via Stripe CLI
- Test endpoints with provided Postman collection

### Deployment Checklist
1. Configure production Stripe keys
2. Set up webhook endpoint with signature verification
3. Update success/cancel URLs in Stripe Dashboard
4. Enable basic error monitoring
5. Test with live mode test charges
6. Wall Type Integration Tests:
   - Test Trust Wall variable pricing:
     - Verify minimum price enforcement
     - Test recommended price display
     - Confirm buyer can pay above minimum
   - Test fixed price walls:
     - Verify gallery price is enforced
     - Check price display format
   - Validate Stripe Connect:
     - Test artist payouts for both pricing models
     - Verify platform fee calculations
7. Database Validation:
   - Run price constraint checks
   - Verify RLS policies for store products
   - Check payment link status transitions
8. UI/UX Verification:
   - Validate wall type badges display
   - Check price formatting for all wall types
   - Test product form validation rules

## Resources
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Connect Platform Guide](https://stripe.com/docs/connect)
- [Webhook Integration](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)