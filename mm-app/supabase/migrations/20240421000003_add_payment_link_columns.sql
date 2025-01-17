-- Add payment_link_id and payment_link_status columns to store_products
ALTER TABLE store_products
ADD COLUMN payment_link_id TEXT,
ADD COLUMN payment_link_status TEXT DEFAULT 'active' CHECK (payment_link_status IN ('active', 'inactive', 'archived'));

-- Create index for faster lookups
CREATE INDEX idx_store_products_payment_link ON store_products(payment_link_id); 