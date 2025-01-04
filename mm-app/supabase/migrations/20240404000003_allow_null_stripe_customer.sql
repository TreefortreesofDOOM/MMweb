-- Allow null stripe_customer_id in ghost_profiles table
ALTER TABLE ghost_profiles ALTER COLUMN stripe_customer_id DROP NOT NULL;

-- Drop the unique constraint and recreate it to exclude nulls
ALTER TABLE ghost_profiles DROP CONSTRAINT unique_stripe_customer;
CREATE UNIQUE INDEX unique_stripe_customer ON ghost_profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Add a comment explaining the change
COMMENT ON COLUMN ghost_profiles.stripe_customer_id IS 'Stripe customer ID, can be null for guest checkouts'; 