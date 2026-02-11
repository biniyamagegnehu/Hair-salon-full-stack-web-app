const crypto = require('crypto');

// Generate secure random strings for JWT secrets
const generateJWTSecrets = () => {
  const accessSecret = crypto.randomBytes(64).toString('hex');
  const refreshSecret = crypto.randomBytes(64).toString('hex');
  
  console.log('🔐 Generated JWT Secrets:');
  console.log('JWT_ACCESS_SECRET=', accessSecret);
  console.log('JWT_REFRESH_SECRET=', refreshSecret);
  console.log('\n📋 Copy these to your .env file');
};

// Generate webhook secret
const generateWebhookSecret = () => {
  const webhookSecret = crypto.randomBytes(32).toString('hex');
  console.log('CHAPA_WEBHOOK_SECRET=', webhookSecret);
};

// Run if called directly
if (require.main === module) {
  generateJWTSecrets();
  generateWebhookSecret();
}

module.exports = { generateJWTSecrets, generateWebhookSecret };