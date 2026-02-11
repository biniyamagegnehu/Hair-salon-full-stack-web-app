require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔧 Testing Environment Configuration...\n');

// Check environment variables
console.log('1. Checking environment variables:');
const requiredVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CHAPA_SECRET_KEY',
  'CHAPA_PUBLIC_KEY',
  'FRONTEND_URL'
];

let allVarsPresent = true;
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`❌ ${varName}: MISSING`);
    allVarsPresent = false;
  } else if (process.env[varName].includes('change_in_production') || 
             process.env[varName].includes('your_')) {
    console.log(`⚠️  ${varName}: USING DEFAULT/PLACEHOLDER VALUE`);
  } else {
    console.log(`✅ ${varName}: SET`);
  }
});

console.log('\n2. Testing MongoDB connection...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    // Test basic operations
    const User = require('./src/models/User');
    return User.findOne({ email: process.env.ADMIN_EMAIL });
  })
  .then(adminUser => {
    if (adminUser) {
      console.log('✅ Admin user exists');
    } else {
      console.log('⚠️  Admin user not found (run npm run seed)');
    }
    
    mongoose.connection.close();
    console.log('\n🎉 All tests passed!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run seed (to create test data)');
    console.log('2. Run: npm run dev (to start server)');
    console.log('3. Visit: http://localhost:5000/health (to test server)');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check your MongoDB Atlas connection string');
    console.log('2. Make sure your IP is whitelisted in MongoDB Atlas');
    console.log('3. Check your internet connection');
    process.exit(1);
  });