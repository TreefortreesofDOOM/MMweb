#!/bin/bash

# Ensure we're in the mm-app directory
cd "$(dirname "$0")/.."

if [ "$1" = "list" ]; then
    echo "Listing all products from transactions..."
    npx ts-node -r tsconfig-paths/register scripts/match-stripe-transactions.ts
elif [ "$1" = "apply" ]; then
    echo "Applying product-artwork mapping..."
    npx ts-node -r tsconfig-paths/register scripts/apply-product-mapping.ts
else
    echo "Usage:"
    echo "  ./scripts/match-transactions.sh list   # List all products needing mapping"
    echo "  ./scripts/match-transactions.sh apply  # Apply the mapping from product-artwork-mapping.yml"
fi 