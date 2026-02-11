require('dotenv').config();

// Check environment variables first
console.log('🚀 Starting X Men\'s Hair Salon Backend...\n');

// Validate critical environment variables
const criticalVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
let hasCriticalErrors = false;

criticalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('change_in_production') || value.includes('your_')) {
    console.error(`❌ CRITICAL: ${varName} is not properly configured in .env file`);
    hasCriticalErrors = true;
  }
});

if (hasCriticalErrors) {
  console.error('\n💡 Please update your .env file with proper values:');
  console.error('1. Generate JWT secrets using: node src/utils/generateSecrets.js');
  console.error('2. Update MongoDB connection string');
  console.error('3. Set Chapa API keys');
  process.exit(1);
}

console.log('✅ Environment variables validated');
console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
console.log(`🔗 MongoDB URI: ${process.env.MONGODB_URI.substring(0, 30)}...`);
console.log(`⚡ Server will run on port: ${process.env.PORT}`);
console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL}\n`);

// Start the server
require('./src/server.js');