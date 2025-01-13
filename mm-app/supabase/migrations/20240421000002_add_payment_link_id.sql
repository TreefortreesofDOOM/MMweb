-- Add payment_link_id column to store_products
ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS payment_link_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_link_status TEXT DEFAULT 'active';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_store_products_payment_link ON store_products(payment_link_id);

-- Add constraint to ensure payment_link_status is valid
ALTER TABLE store_products
  ADD CONSTRAINT valid_payment_link_status
  CHECK (payment_link_status IN ('active', 'inactive', 'archived')); 