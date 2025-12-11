# Klyr Edge Functions Deployment Script (PowerShell)
# This script deploys all payment processing edge functions to Supabase

Write-Host "Deploying Klyr Edge Functions..." -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCmd) {
    Write-Host "Supabase CLI not found." -ForegroundColor Red
    Write-Host "Please install it using one of these methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 - Using Scoop (Recommended for Windows):" -ForegroundColor Cyan
    Write-Host "  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
    Write-Host "  scoop install supabase"
    Write-Host ""
    Write-Host "Option 2 - Using npm (via npx):" -ForegroundColor Cyan
    Write-Host "  Use 'npx supabase' instead of 'supabase' in commands"
    Write-Host ""
    Write-Host "Option 3 - Download binary:" -ForegroundColor Cyan
    Write-Host "  https://github.com/supabase/cli/releases"
    Write-Host ""
    exit 1
}

# Check if logged in
Write-Host "Checking Supabase authentication..." -ForegroundColor Yellow
$loginCheck = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Supabase. Please run: supabase login" -ForegroundColor Red
    exit 1
}

Write-Host "Authenticated" -ForegroundColor Green
Write-Host ""

# Function to deploy with error handling
function Deploy-Function {
    param (
        [string]$FunctionName,
        [bool]$VerifyJWT = $false
    )
    
    Write-Host "Deploying $FunctionName..." -ForegroundColor Yellow

    if ($VerifyJWT) {
        supabase functions deploy $FunctionName --project-ref crkhkzcscgoeyspaczux
    } else {
        supabase functions deploy $FunctionName --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "$FunctionName deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to deploy $FunctionName" -ForegroundColor Red
    }
    Write-Host ""
}

# Deploy payment functions
Deploy-Function -FunctionName "create-payment-intent" -VerifyJWT $true
Deploy-Function -FunctionName "monitor-blockchain" -VerifyJWT $false
Deploy-Function -FunctionName "settle-payment" -VerifyJWT $false
Deploy-Function -FunctionName "deliver-webhooks" -VerifyJWT $false

# Deploy existing KYB functions
Deploy-Function -FunctionName "wallet-nonce" -VerifyJWT $false
Deploy-Function -FunctionName "prove-control" -VerifyJWT $false
Deploy-Function -FunctionName "submit-kyb" -VerifyJWT $false

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify functions at: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions"
Write-Host "2. Set up cron jobs (see supabase/functions/_cron/README.md)"
Write-Host "3. Test payment flow"
Write-Host ""

