-- Convert existing amounts from cents to dollars
UPDATE transactions 
SET 
  amount_total = amount_total / 100,
  amount_received = amount_received / 100
WHERE amount_total > 0;

-- Update ghost profile totals
UPDATE ghost_profiles
SET total_spent = total_spent / 100
WHERE total_spent > 0; 