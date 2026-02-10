#!/usr/bin/env pwsh
# Setup Persona Integration for Global Pay Connect
# This script configures all necessary Persona credentials in Supabase

Write-Host "🔐 Setting up Persona Integration..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$PERSONA_API_KEY = "<your-persona-api-key>"
$PERSONA_TEMPLATE_ID = "<your-persona-template-id>"
$PERSONA_ENVIRONMENT = "sandbox"
$SUPABASE_PROJECT_REF = "crkhkzcscgoeyspaczux"

# Determine frontend URL
Write-Host "📍 What is your frontend URL?" -ForegroundColor Yellow
Write-Host "   1. Local development (http://localhost:8080)" -ForegroundColor Gray
Write-Host "   2. Production (custom URL)" -ForegroundColor Gray
Write-Host ""
$urlChoice = Read-Host "Enter choice (1 or 2)"

if ($urlChoice -eq "2") {
    $FRONTEND_URL = Read-Host "Enter your production frontend URL (e.g., https://app.klyr.io)"
} else {
    $FRONTEND_URL = "http://localhost:8080"
}

Write-Host ""
Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "   API Key: $PERSONA_API_KEY" -ForegroundColor Gray
Write-Host "   Template ID: $PERSONA_TEMPLATE_ID" -ForegroundColor Gray
Write-Host "   Environment: $PERSONA_ENVIRONMENT" -ForegroundColor Gray
Write-Host "   Frontend URL: $FRONTEND_URL" -ForegroundColor Gray
Write-Host ""

# Confirm before proceeding
$confirm = Read-Host "Proceed with configuration? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Setup cancelled" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔗 Linking to Supabase project..." -ForegroundColor Cyan
npx supabase link --project-ref $SUPABASE_PROJECT_REF

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to link to Supabase project" -ForegroundColor Red
    Write-Host "💡 Make sure you're logged in: npx supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔑 Setting Persona API credentials..." -ForegroundColor Cyan

# Set PERSONA_API_KEY
Write-Host "   → Setting PERSONA_API_KEY..." -ForegroundColor Gray
npx supabase secrets set PERSONA_API_KEY="$PERSONA_API_KEY"

# Set PERSONA_TEMPLATE_ID
Write-Host "   → Setting PERSONA_TEMPLATE_ID..." -ForegroundColor Gray
npx supabase secrets set PERSONA_TEMPLATE_ID="$PERSONA_TEMPLATE_ID"

# Set PERSONA_ENVIRONMENT
Write-Host "   → Setting PERSONA_ENVIRONMENT..." -ForegroundColor Gray
npx supabase secrets set PERSONA_ENVIRONMENT="$PERSONA_ENVIRONMENT"

# Set FRONTEND_URL
Write-Host "   → Setting FRONTEND_URL..." -ForegroundColor Gray
npx supabase secrets set FRONTEND_URL="$FRONTEND_URL"

Write-Host ""
Write-Host "✅ Persona credentials configured successfully!" -ForegroundColor Green
Write-Host ""

# List all secrets to verify
Write-Host "📋 Verifying secrets..." -ForegroundColor Cyan
npx supabase secrets list

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ STEP 1 COMPLETE: Persona API Credentials Configured" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 NEXT STEP: Configure Webhook in Persona Dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Go to: https://dashboard.withpersona.com" -ForegroundColor Gray
Write-Host "   2. Navigate to: Settings → Webhooks" -ForegroundColor Gray
Write-Host "   3. Click: 'Add Webhook' or 'Create Webhook'" -ForegroundColor Gray
Write-Host "   4. Enter this URL:" -ForegroundColor Gray
Write-Host ""
Write-Host "      https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/persona-webhook" -ForegroundColor Cyan
Write-Host ""
Write-Host "   5. Select these events:" -ForegroundColor Gray
Write-Host "      ✅ inquiry.started" -ForegroundColor Gray
Write-Host "      ✅ inquiry.completed" -ForegroundColor Gray
Write-Host "      ✅ inquiry.failed" -ForegroundColor Gray
Write-Host "      ✅ inquiry.expired" -ForegroundColor Gray
Write-Host "      ✅ report.ready" -ForegroundColor Gray
Write-Host ""
Write-Host "   6. Click 'Create' or 'Save'" -ForegroundColor Gray
Write-Host "   7. Copy the Webhook Secret (starts with 'whsec_')" -ForegroundColor Gray
Write-Host ""
Write-Host "   8. Run this command with your webhook secret:" -ForegroundColor Gray
Write-Host "      npx supabase secrets set PERSONA_WEBHOOK_SECRET=`"whsec_YOUR_SECRET_HERE`"" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

