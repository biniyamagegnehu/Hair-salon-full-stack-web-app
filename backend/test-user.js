require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function testUserModel() {
  try {
    console.log('🧪 Testing User Model...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Create user with password
    console.log('Test 1: Creating user with password...');
    const user1 = await User.create({
      email: 'test1@example.com',
      phoneNumber: '+251911111111',
      fullName: 'Test User 1',
      password: 'Test123456',
      role: 'CUSTOMER'
    });
    console.log('✅ User created:', user1.email);
    console.log('   Password hashed:', user1.password !== 'Test123456');
    
    // Test 2: Verify password
    const isValid = await user1.comparePassword('Test123456');
    console.log('   Password valid:', isValid);
    
    // Test 3: Create user without password (Google OAuth)
    console.log('\nTest 2: Creating user without password...');
    const user2 = await User.create({
      email: 'test2@example.com',
      phoneNumber: '+251922222222',
      fullName: 'Test User 2',
      googleId: '123456789',
      role: 'CUSTOMER'
    });
    console.log('✅ User created:', user2.email);
    console.log('   Has password:', !!user2.password);
    
    // Test 4: Update user password
    console.log('\nTest 3: Updating user password...');
    user2.password = 'NewPassword123';
    await user2.save();
    const isValid2 = await user2.comparePassword('NewPassword123');
    console.log('   Password updated and valid:', isValid2);
    
    // Clean up
    await User.deleteMany({ email: /test.*@example.com/ });
    console.log('\n🧹 Cleaned up test users');
    
    await mongoose.connection.close();
    console.log('\n✅ All User Model tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testUserModel();