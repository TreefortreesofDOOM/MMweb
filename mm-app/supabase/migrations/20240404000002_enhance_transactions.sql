-- Add payment status enum
CREATE TYPE payment_status AS ENUM (
  'succeeded',
  'processing',
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
  'canceled'
);

-- Add ghost profile reference and Stripe-specific fields to transactions
ALTER TABLE transactions
  -- Link to ghost profiles
  ADD COLUMN ghost_profile_id UUID REFERENCES ghost_profiles(id),
  
  -- Payment intent details
  ADD COLUMN payment_intent_status TEXT,
  ADD COLUMN amount_received INTEGER,
  ADD COLUMN capture_method TEXT,
  ADD COLUMN confirmation_method TEXT,
  ADD COLUMN description TEXT,
  ADD COLUMN invoice_id TEXT,
  ADD COLUMN statement_descriptor TEXT,
  ADD COLUMN statement_descriptor_suffix TEXT,

  -- Payment method details
  ADD COLUMN payment_method_id TEXT,
  ADD COLUMN payment_method_types TEXT[],
  ADD COLUMN payment_method_details JSONB,
  
  -- Card details
  ADD COLUMN card_brand TEXT,
  ADD COLUMN card_last4 TEXT,
  ADD COLUMN card_exp_month INTEGER,
  ADD COLUMN card_exp_year INTEGER,
  ADD COLUMN card_country TEXT,
  
  -- Stripe timestamps
  ADD COLUMN stripe_created TIMESTAMP WITH TIME ZONE,
  ADD COLUMN stripe_canceled_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN stripe_processing_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN stripe_succeeded_at TIMESTAMP WITH TIME ZONE,
  
  -- Error handling
  ADD COLUMN error_message TEXT,
  ADD COLUMN error_code TEXT,
  ADD COLUMN last_payment_error JSONB;

-- Convert status to use enum
ALTER TABLE transactions 
  ALTER COLUMN status TYPE payment_status 
  USING status::payment_status;

-- Add new indexes
CREATE INDEX idx_transactions_ghost_profile ON transactions(ghost_profile_id);
CREATE INDEX idx_transactions_payment_status ON transactions(status);
CREATE INDEX idx_transactions_stripe_created ON transactions(stripe_created DESC);

-- Now that transactions table has ghost_profile_id, add the artist access policy to ghost_profiles
CREATE POLICY "Artists can view ghost profiles that bought their art"
  ON ghost_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      JOIN artworks a ON t.artwork_id = a.id
      WHERE a.artist_id = auth.uid()
      AND t.ghost_profile_id = ghost_profiles.id
    )
  );

-- Update RLS policies to include ghost profile access
CREATE POLICY "Ghost profiles can view their transactions"
  ON transactions FOR SELECT
  USING (ghost_profile_id IN (
    SELECT id FROM ghost_profiles 
    WHERE stripe_customer_id = current_setting('stripe.customer_id', TRUE)
  ));

-- Add function to update ghost profile totals
CREATE OR REPLACE FUNCTION update_ghost_profile_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND NEW.ghost_profile_id IS NOT NULL THEN
    UPDATE ghost_profiles
    SET 
      total_purchases = total_purchases + 1,
      total_spent = total_spent + NEW.amount_total,
      last_purchase_date = NEW.created_at
    WHERE id = NEW.ghost_profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updating ghost profile totals
CREATE TRIGGER update_ghost_totals
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_ghost_profile_totals();

-- Add function to set Stripe timestamps based on status changes
CREATE OR REPLACE FUNCTION set_stripe_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    CASE NEW.status
      WHEN 'succeeded' THEN
        NEW.stripe_succeeded_at = NOW();
      WHEN 'processing' THEN
        NEW.stripe_processing_at = NOW();
      WHEN 'canceled' THEN
        NEW.stripe_canceled_at = NOW();
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for status timestamps
CREATE TRIGGER set_status_timestamp
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_stripe_status_timestamp(); 