#!/bin/bash

# Klyr Edge Functions Deployment Script
# This script deploys all payment processing edge functions to Supabase

echo "🚀 Deploying Klyr Edge Functions..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if logged in
echo "📝 Checking Supabase authentication..."
supabase projects list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Supabase. Please run: supabase login"
    exit 1
fi

echo "✅ Authenticated"
echo ""

# Deploy create-payment-intent
echo "📦 Deploying create-payment-intent..."
supabase functions deploy create-payment-intent --project-ref crkhkzcscgoeyspaczux
if [ $? -eq 0 ]; then
    echo "✅ create-payment-intent deployed"
else
    echo "❌ Failed to deploy create-payment-intent"
fi
echo ""

# Deploy monitor-blockchain
echo "📦 Deploying monitor-blockchain..."
supabase functions deploy monitor-blockchain --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "✅ monitor-blockchain deployed"
else
    echo "❌ Failed to deploy monitor-blockchain"
fi
echo ""

# Deploy settle-payment
echo "📦 Deploying settle-payment..."
supabase functions deploy settle-payment --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "✅ settle-payment deployed"
else
    echo "❌ Failed to deploy settle-payment"
fi
echo ""

# Deploy deliver-webhooks
echo "📦 Deploying deliver-webhooks..."
supabase functions deploy deliver-webhooks --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "✅ deliver-webhooks deployed"
else
    echo "❌ Failed to deploy deliver-webhooks"
fi
echo ""

# Deploy existing KYB functions
echo "📦 Deploying wallet-nonce..."
supabase functions deploy wallet-nonce --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "✅ wallet-nonce deployed"
else
    echo "❌ Failed to deploy wallet-nonce"
fi
echo ""

echo "📦 Deploying prove-control..."
supabase functions deploy prove-control --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "✅ prove-control deployed"
else
    echo "❌ Failed to deploy prove-control"
fi
echo ""

echo "📦 Deploying submit-kyb..."
supabase functions deploy submit-kyb --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
if [ $? -eq 0 ]; then
    echo "✅ submit-kyb deployed"
else
    echo "❌ Failed to deploy submit-kyb"
fi
echo ""

echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify functions at: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions"
echo "2. Set up cron jobs (see supabase/functions/_cron/README.md)"
echo "3. Test payment flow (run: npm run test:payment)"
echo ""

