-- Add Stripe fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_external_account_setup BOOLEAN DEFAULT FALSE;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID REFERENCES artworks(id),
  buyer_id UUID REFERENCES auth.users(id),
  artist_id UUID REFERENCES auth.users(id),
  amount_total INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  artist_amount INTEGER NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions (as buyer or artist)
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (buyer_id = auth.uid() OR artist_id = auth.uid());

-- Only the system can insert transactions
CREATE POLICY "System can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- Only admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS transactions_buyer_id_idx ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS transactions_artist_id_idx ON transactions(artist_id);
CREATE INDEX IF NOT EXISTS transactions_artwork_id_idx ON transactions(artwork_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status); 