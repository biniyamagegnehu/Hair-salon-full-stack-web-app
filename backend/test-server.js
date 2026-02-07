const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful');
    
    // Test models
    const User = require('./src/models/User');
    const SalonConfig = require('./src/models/SalonConfig');
    
    console.log('✅ Models loaded successfully');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
    console.log('\n🎉 Backend setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update .env with your actual values');
    console.log('2. Run "npm run dev" to start the server');
    console.log('3. Test endpoints with Postman or curl');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();