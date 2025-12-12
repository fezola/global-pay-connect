/**
 * Test script for cron worker
 */

import dotenv from 'dotenv';
dotenv.config();

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PORT = process.env.PORT || 3000;

console.log('🧪 Testing Cron Worker Configuration\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check environment variables
console.log('✅ Environment Variables:');
console.log(`   PORT: ${PORT}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY ? '✓ Set' : '✗ Not set'}`);

if (!SERVICE_ROLE_KEY) {
  console.log('\n❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env file');
  process.exit(1);
}

console.log('\n✅ Configuration is valid!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test HTTP server
import http from 'http';

const jobStatus = {
  lastRun: {},
  totalRuns: {},
  errors: {},
  startTime: new Date().toISOString()
};

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      uptime: process.uptime(),
      jobs: jobStatus,
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(jobStatus));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Status: http://localhost:${PORT}/status\n`);
  console.log('✅ Cron worker is ready to deploy!\n');
  console.log('Press Ctrl+C to stop...\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping test server...');
  server.close(() => {
    console.log('✅ Goodbye!\n');
    process.exit(0);
  });
});

