-- Remove unnecessary Stripe fields
ALTER TABLE profiles
DROP COLUMN IF EXISTS stripe_charges_enabled,
DROP COLUMN IF EXISTS stripe_payouts_enabled,
DROP COLUMN IF EXISTS stripe_external_account_setup; 