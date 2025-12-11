# Generate Hot Wallet for Payouts
Write-Host "🔐 Generating Solana Hot Wallet..." -ForegroundColor Cyan
Write-Host ""

# Check if dependencies are installed
if (-not (Test-Path "node_modules/@solana/web3.js")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install @solana/web3.js bs58
    Write-Host ""
}

# Run the generator
node scripts/generate-hot-wallet.js

# Pause so user can read
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

