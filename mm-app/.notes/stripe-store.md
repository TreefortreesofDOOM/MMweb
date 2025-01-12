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
    - price: Integer (in cents)
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

## Resources
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Connect Platform Guide](https://stripe.com/docs/connect)
- [Webhook Integration](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)