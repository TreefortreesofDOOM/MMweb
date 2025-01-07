-- Create a function to match transactions with products
create or replace function match_transactions_with_products()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    transaction_record record;
    payment_intent_id text;
    artwork_id text;
    matched_count int := 0;
    error_count int := 0;
begin
    -- Log start of matching process
    raise notice 'Starting transaction-product matching process';
    
    -- Loop through transactions without artwork_id
    for transaction_record in 
        select id, stripe_payment_intent_id, metadata
        from transactions 
        where artwork_id is null 
        and stripe_payment_intent_id is not null
        and status = 'succeeded'
    loop
        begin
            -- Extract payment intent ID
            payment_intent_id := transaction_record.stripe_payment_intent_id;
            
            -- Check if artwork_id exists in metadata
            if transaction_record.metadata->>'artwork_id' is not null then
                artwork_id := transaction_record.metadata->>'artwork_id';
                
                -- Update transaction with artwork_id
                update transactions
                set artwork_id = artwork_id,
                    updated_at = now()
                where id = transaction_record.id;
                
                matched_count := matched_count + 1;
            end if;
            
        exception when others then
            -- Log error and continue with next record
            raise warning 'Error processing transaction %: %', transaction_record.id, sqlerrm;
            error_count := error_count + 1;
        end;
    end loop;
    
    -- Log completion
    raise notice 'Matching process completed. Matched: %, Errors: %', matched_count, error_count;
end;
$$;

-- Execute the matching function
select match_transactions_with_products();

-- Drop the function after execution
drop function match_transactions_with_products();

-- Add a comment to transactions table
comment on column transactions.artwork_id is 'The ID of the artwork purchased in this transaction. Retroactively matched using payment intent data.'; 