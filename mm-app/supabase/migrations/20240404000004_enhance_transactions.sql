-- Add Stripe-specific fields to transactions table
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS payment_intent_status TEXT,
  ADD COLUMN IF NOT EXISTS amount_received INTEGER,
  ADD COLUMN IF NOT EXISTS capture_method TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_method_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_method_type TEXT,
  ADD COLUMN IF NOT EXISTS card_brand TEXT,
  ADD COLUMN IF NOT EXISTS card_last4 TEXT,
  ADD COLUMN IF NOT EXISTS card_exp_month INTEGER,
  ADD COLUMN IF NOT EXISTS card_exp_year INTEGER,
  ADD COLUMN IF NOT EXISTS billing_name TEXT,
  ADD COLUMN IF NOT EXISTS billing_email TEXT,
  ADD COLUMN IF NOT EXISTS billing_phone TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_city TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_state TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_postal_code TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_country TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS refund_status TEXT,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT,
  ADD COLUMN IF NOT EXISTS ghost_profile_id UUID REFERENCES ghost_profiles(id);

-- Add index for ghost profile lookups
CREATE INDEX IF NOT EXISTS transactions_ghost_profile_id_idx ON transactions(ghost_profile_id);

-- Add RLS policy for ghost profile access
CREATE POLICY "Users can view transactions for their claimed ghost profiles"
  ON transactions FOR SELECT
  USING (
    ghost_profile_id IN (
      SELECT id FROM ghost_profiles 
      WHERE claimed_profile_id = auth.uid()
    )
  );

-- Add function to set Stripe timestamps
CREATE OR REPLACE FUNCTION set_stripe_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status != OLD.status THEN
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to set Stripe timestamps
CREATE TRIGGER set_stripe_timestamps_trigger
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_stripe_timestamps(); 