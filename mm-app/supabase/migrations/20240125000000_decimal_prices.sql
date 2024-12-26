-- Convert price column to decimal with 2 decimal places
ALTER TABLE "public"."artworks" 
  ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2) 
  USING price::decimal/100;

-- Update price check constraint
ALTER TABLE "public"."artworks" DROP CONSTRAINT IF EXISTS "artworks_price_check";
ALTER TABLE "public"."artworks" ADD CONSTRAINT "artworks_price_check" 
  CHECK (price >= 0 AND price <= 1000000); 