# Update documentation script
Write-Host "Starting documentation update..."

# Get the current directory where this script is running
$scriptPath = $PSScriptRoot

# Run directory structure update
Write-Host "`nUpdating directory structure..."
& "$scriptPath\update_directory.ps1"

# Run database schema update
Write-Host "`nUpdating database schema..."
& "$scriptPath\fetch-db-schema.ps1"

Write-Host "`nDocumentation update complete!"
Write-Host "- Directory structure: ../.notes/directory_structure.md"
Write-Host "- Database schema: ../.notes/database_schema_$(Get-Date -Format 'yyyyMMdd_HHmmss').md" 