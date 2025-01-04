-- Create ghost profiles table
CREATE TABLE IF NOT EXISTS ghost_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  is_claimed BOOLEAN DEFAULT FALSE,
  display_name TEXT DEFAULT 'Art Collector',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  total_purchases INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT FALSE,
  claimed_profile_id UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT unique_email UNIQUE(email),
  CONSTRAINT unique_stripe_customer UNIQUE(stripe_customer_id)
);

-- Add RLS policies
ALTER TABLE ghost_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins have full access to ghost profiles" ON ghost_profiles;
DROP POLICY IF EXISTS "Public can view visible ghost profiles" ON ghost_profiles;

-- Admins can do everything (using service role)
CREATE POLICY "Service role has full access to ghost profiles"
  ON ghost_profiles
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Public can view visible ghost profiles
CREATE POLICY "Public can view visible ghost profiles"
  ON ghost_profiles
  FOR SELECT
  USING (is_visible = true);

-- Add indexes for performance
CREATE INDEX idx_ghost_profiles_email ON ghost_profiles(email);
CREATE INDEX idx_ghost_profiles_stripe_customer ON ghost_profiles(stripe_customer_id);
CREATE INDEX idx_ghost_profiles_is_visible ON ghost_profiles(is_visible) WHERE is_visible = TRUE;
CREATE INDEX idx_ghost_profiles_claimed ON ghost_profiles(claimed_profile_id) WHERE claimed_profile_id IS NOT NULL;

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON ghost_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: The artist access policy will be added in the next migration after transactions table is modified 