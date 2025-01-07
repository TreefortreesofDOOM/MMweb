param(
    [Parameter(Position=0)]
    [string]$Command
)

# Ensure we're in the mm-app directory
Set-Location (Split-Path $PSScriptRoot)

# Check and install required dependencies
Write-Host "Checking dependencies..."
$packages = @("tsconfig-paths", "yaml")
foreach ($package in $packages) {
    if (-not (Test-Path "node_modules/$package")) {
        Write-Host "Installing $package..."
        npm install $package --legacy-peer-deps
    }
}

switch ($Command) {
    "list" {
        Write-Host "Listing all products from transactions..."
        npx ts-node -r tsconfig-paths/register scripts/match-stripe-transactions.ts
    }
    "apply" {
        Write-Host "Applying product-artwork mapping..."
        npx ts-node -r tsconfig-paths/register scripts/apply-product-mapping.ts
    }
    default {
        Write-Host "Usage:"
        Write-Host "  .\scripts\match-transactions.ps1 list   # List all products needing mapping"
        Write-Host "  .\scripts\match-transactions.ps1 apply  # Apply the mapping from product-artwork-mapping.yml"
    }
} 