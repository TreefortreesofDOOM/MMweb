# Fetch Database Schema Script
# This script connects to local Supabase and dumps schema information

$ErrorActionPreference = "Stop"

# Check if PSQL environment variable is set
if (-not $env:PSQL) {
    Write-Host "`nError: PSQL environment variable is not set.`n" -ForegroundColor Red
    Write-Host "Please ensure the PSQL environment variable points to your PostgreSQL bin directory." -ForegroundColor Yellow
    exit 1
}

# Add PSQL to Path for this session
$env:Path = "$env:PSQL;$env:Path"

# Check if psql is now accessible
try {
    $null = & "$env:PSQL\psql.exe" --version
} catch {
    Write-Host "`nError: Could not find psql.exe in $env:PSQL`n" -ForegroundColor Red
    Write-Host "Please verify that psql.exe exists in the directory specified by PSQL environment variable." -ForegroundColor Yellow
    exit 1
}

# Supabase settings from config.toml
$PGHOST="192.168.86.29"  # Updated to match local config
$PGPORT="54322"
$PGDATABASE="postgres"
$PGUSER="postgres"
$env:PGPASSWORD="postgres"  # Set as environment variable

# Get the script's directory and set paths relative to mm-app root
$scriptPath = $PSScriptRoot
$notesDir = Join-Path $scriptPath ".." ".notes"
$outputFile = Join-Path $notesDir "database_schema_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"

# Function to execute psql commands and append to output file
function Invoke-PsqlCommand {
    param (
        [string]$query,
        [string]$section
    )
    
    Write-Host "Fetching $section..."
    
    # Create the section header
    "## $section`n" | Out-File -FilePath $outputFile -Append -Encoding utf8
    "``````sql" | Out-File -FilePath $outputFile -Append -Encoding utf8
    
    # Execute the query and append results
    $result = $query | psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -A -t
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to execute query for section: $section"
        return
    }
    
    $result | Out-File -FilePath $outputFile -Append -Encoding utf8
    "``````" | Out-File -FilePath $outputFile -Append -Encoding utf8
    "`n" | Out-File -FilePath $outputFile -Append -Encoding utf8
}

# Create the initial file with header
@"
# Database Schema Documentation
Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Connection: postgresql://postgres@192.168.86.29:54322/postgres

## Table of Contents
1. [Tables and Columns](#tables-and-columns)
2. [Foreign Key Relationships](#foreign-key-relationships)
3. [RLS Policies](#rls-policies)
4. [Functions](#functions)
5. [Triggers](#triggers)
6. [Views](#views)
7. [Indexes](#indexes)

"@ | Out-File -FilePath $outputFile -Encoding utf8

# Check psql version
$psqlVersion = psql --version
Write-Host "Using psql version: $psqlVersion"

Write-Host "Connecting to Supabase at 192.168.86.29:54322..."
Write-Host "Testing database connection..."

# Test connection
"SELECT 1;" | psql -h 192.168.86.29 -p 54322 -U postgres -d postgres -A -t
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database connection successful"
} else {
    Write-Error "Failed to connect to database"
    exit 1
}

# Tables and Columns
$tablesQuery = @"
SELECT 
    format(E'### Table: %s\n', table_name) ||
    format(E'Schema: %s\n\n', table_schema) ||
    format(E'| Column | Type | Nullable | Default | Description |\n') ||
    format(E'|--------|------|----------|----------|--------------|\n') ||
    string_agg(
        format(E'| %s | %s | %s | %s | %s |',
            column_name,
            data_type,
            is_nullable,
            COALESCE(column_default, ''),
            COALESCE(col_description(format('%I.%I', table_schema, table_name)::regclass::oid, ordinal_position), '')
        ),
        E'\n'
        ORDER BY ordinal_position
    )
FROM information_schema.columns
WHERE table_schema IN ('public', 'auth', 'storage')
    AND table_name NOT LIKE 'pg_%'
GROUP BY table_schema, table_name
ORDER BY table_schema, table_name;
"@
Invoke-PsqlCommand -query $tablesQuery -section "Tables and Columns"

# Foreign Key Relationships
$fkQuery = @"
SELECT
    format(E'- %s.%s.%s -> %s.%s.%s',
        fk.table_schema,
        fk.table_name,
        fk.column_name,
        fk.foreign_table_schema,
        fk.foreign_table_name,
        fk.foreign_column_name
    ) as relationship
FROM (
    SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk
ORDER BY fk.table_schema, fk.table_name;
"@
Invoke-PsqlCommand -query $fkQuery -section "Foreign Key Relationships"

# RLS Policies
$rlsQuery = @"
SELECT format(E'### Table: %s\n\n%s\n', tablename, string_agg(format(
    E'- Policy: %s\n  - Roles: %s\n  - Command: %s\n  - Definition: %s\n',
    policyname,
    roles,
    cmd,
    COALESCE(qual::text, '') || CASE WHEN qual IS NOT NULL AND with_check IS NOT NULL THEN E'\n  - With Check: ' ELSE '' END || COALESCE(with_check::text, '')
), E'\n'))
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
"@
Invoke-PsqlCommand -query $rlsQuery -section "RLS Policies"

# Functions
$functionsQuery = @"
SELECT format(E'### Function: %s\n\n```sql\n%s\n```\n',
    p.proname,
    pg_get_functiondef(p.oid)
)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.prokind = 'f'  -- Normal function (not aggregate or window)
ORDER BY p.proname;
"@
Invoke-PsqlCommand -query $functionsQuery -section "Functions"

# Triggers
$triggersQuery = @"
SELECT format(E'### Trigger: %s\n- Table: %s\n- Function: %s\n- Events: %s\n',
    trigger_name,
    event_object_table,
    action_statement,
    string_agg(event_manipulation, ', ')
)
FROM information_schema.triggers
WHERE trigger_schema = 'public'
GROUP BY trigger_name, event_object_table, action_statement
ORDER BY trigger_name;
"@
Invoke-PsqlCommand -query $triggersQuery -section "Triggers"

# Views
$viewsQuery = @"
SELECT format(E'### View: %s\n\n```sql\n%s\n```\n',
    table_name,
    view_definition
)
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;
"@
Invoke-PsqlCommand -query $viewsQuery -section "Views"

# Indexes
$indexesQuery = @"
SELECT format(E'### Table: %s\n%s\n',
    tablename,
    string_agg(format(E'- %s: %s', indexname, indexdef), E'\n')
)
FROM (
    SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
) i
GROUP BY schemaname, tablename
ORDER BY tablename;
"@
Invoke-PsqlCommand -query $indexesQuery -section "Indexes"

Write-Host "Schema documentation has been generated at: $outputFile" 