# Deploy API Function
Write-Host "Deploying API function..." -ForegroundColor Cyan

# Deploy api-v1 function
npx supabase functions deploy api-v1 --project-ref crkhkzcscgoeyspaczux --no-verify-jwt

if ($LASTEXITCODE -eq 0) {
    Write-Host "API function deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "API Base URL:" -ForegroundColor Yellow
    Write-Host "https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1"
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Get your API key from the dashboard"
    Write-Host "2. Test the API with the test script"
    Write-Host "3. Try the SDK examples"
} else {
    Write-Host "Deployment failed" -ForegroundColor Red
}

