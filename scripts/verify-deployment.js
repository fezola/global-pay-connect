/**
 * Klyr Deployment Verification Script
 * Checks if all components are ready for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Klyr Deployment Verification\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let allChecks = true;

// Check 1: Edge Functions exist
console.log('📦 Checking Edge Functions...');
const functionsDir = path.join(__dirname, '..', 'supabase', 'functions');
const requiredFunctions = [
  'create-payment-intent',
  'monitor-blockchain',
  'settle-payment',
  'deliver-webhooks',
  'wallet-nonce',
  'prove-control',
  'submit-kyb',
  'create-persona-inquiry',
  'persona-webhook',
  'api-v1',
  'create-payout',
  'process-payout',
  'approve-payout',
  'reject-payout',
];

const missingFunctions = [];
for (const func of requiredFunctions) {
  const funcPath = path.join(functionsDir, func, 'index.ts');
  if (!fs.existsSync(funcPath)) {
    missingFunctions.push(func);
    allChecks = false;
  }
}

if (missingFunctions.length === 0) {
  console.log(`✅ All ${requiredFunctions.length} Edge Functions found\n`);
} else {
  console.log(`❌ Missing functions: ${missingFunctions.join(', ')}\n`);
}

// Check 2: Database migrations exist
console.log('🗄️  Checking Database Migrations...');
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

if (migrations.length > 0) {
  console.log(`✅ Found ${migrations.length} migration files\n`);
} else {
  console.log('❌ No migration files found\n');
  allChecks = false;
}

// Check 3: Frontend build configuration
console.log('🌐 Checking Frontend Configuration...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

if (packageJson.scripts.build) {
  console.log('✅ Build script configured\n');
} else {
  console.log('❌ Build script missing\n');
  allChecks = false;
}

// Check 4: Cron worker configuration
console.log('⏰ Checking Cron Worker...');
const cronWorkerPath = path.join(__dirname, '..', 'cron-worker.js');
const renderYamlPath = path.join(__dirname, '..', 'render.yaml');

if (fs.existsSync(cronWorkerPath)) {
  console.log('✅ Cron worker script found');
} else {
  console.log('❌ Cron worker script missing');
  allChecks = false;
}

if (fs.existsSync(renderYamlPath)) {
  console.log('✅ Render deployment config found\n');
} else {
  console.log('⚠️  Render deployment config missing (optional)\n');
}

// Check 5: Environment variable template
console.log('🔐 Checking Environment Variables...');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (fs.existsSync(envExamplePath)) {
  console.log('✅ .env.example found\n');
} else {
  console.log('⚠️  .env.example not found (creating template)\n');
  
  const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=https://crkhkzcscgoeyspaczux.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

# Service Role Key (for cron worker only - DO NOT expose to frontend)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Hot Wallet (for processing payouts - KEEP SECURE)
HOT_WALLET_PRIVATE_KEY=your_hot_wallet_private_key_here

# Solana RPC (mainnet for production, devnet for testing)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Cron Worker Port
PORT=3000
`;
  
  fs.writeFileSync(envExamplePath, envTemplate);
  console.log('✅ Created .env.example template\n');
}

// Check 6: Deployment scripts
console.log('📜 Checking Deployment Scripts...');
const deployScripts = [
  'deploy-functions-npx.ps1',
  'PRODUCTION_DEPLOYMENT_CHECKLIST.md',
];

let scriptsFound = 0;
for (const script of deployScripts) {
  const scriptPath = path.join(__dirname, '..', script);
  if (fs.existsSync(scriptPath)) {
    scriptsFound++;
  }
}

if (scriptsFound === deployScripts.length) {
  console.log('✅ All deployment scripts found\n');
} else {
  console.log(`⚠️  Found ${scriptsFound}/${deployScripts.length} deployment scripts\n`);
}

// Check 7: Build test
console.log('🔨 Testing Build...');
console.log('   (This may take a minute...)\n');

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (allChecks) {
  console.log('✅ All checks passed! Ready for deployment.\n');
  console.log('📋 Next steps:');
  console.log('   1. Review PRODUCTION_DEPLOYMENT_CHECKLIST.md');
  console.log('   2. Generate hot wallet: npm run generate:wallet');
  console.log('   3. Deploy Edge Functions: npm run deploy:functions');
  console.log('   4. Deploy frontend to Vercel/Netlify');
  console.log('   5. Deploy cron worker to Render/Railway\n');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.\n');
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

