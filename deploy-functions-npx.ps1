# Klyr Edge Functions Deployment Script (Using npx)
# This script deploys all payment processing edge functions to Supabase using npx

Write-Host "Deploying Klyr Edge Functions using npx..." -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "Checking Supabase authentication..." -ForegroundColor Yellow
$loginCheck = npx supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Supabase." -ForegroundColor Red
    Write-Host "Running login command..." -ForegroundColor Yellow
    npx supabase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login failed. Please try again." -ForegroundColor Red
        exit 1
    }
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
        npx supabase functions deploy $FunctionName --project-ref crkhkzcscgoeyspaczux
    } else {
        npx supabase functions deploy $FunctionName --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$FunctionName deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to deploy $FunctionName" -ForegroundColor Red
    }
    Write-Host ""
}

# Deploy payment functions
Write-Host "=== Deploying Payment Functions ===" -ForegroundColor Magenta
Deploy-Function -FunctionName "create-payment-intent" -VerifyJWT $true
Deploy-Function -FunctionName "monitor-blockchain" -VerifyJWT $false
Deploy-Function -FunctionName "settle-payment" -VerifyJWT $false
Deploy-Function -FunctionName "deliver-webhooks" -VerifyJWT $false

# Deploy existing KYB functions
Write-Host "=== Deploying KYB Functions ===" -ForegroundColor Magenta
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

