const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', require('./src/models/User').schema);
    
    // Find admin user
    const admin = await User.findOne({ email: 'admin@xsalon.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log('📧 Admin Email:', admin.email);
    console.log('👤 Admin Role:', admin.role);
    console.log('🔑 Has Password:', !!admin.password);
    console.log('📝 Password Hash:', admin.password.substring(0, 20) + '...\n');

    // Test password comparison directly with bcrypt
    const testPassword = 'Admin@123456';
    
    // Method 1: Using model method
    console.log('🔍 Testing model.comparePassword():');
    const modelResult = await admin.comparePassword(testPassword);
    console.log('Result:', modelResult ? '✅ SUCCESS' : '❌ FAILED');
    
    // Method 2: Direct bcrypt comparison
    console.log('\n🔍 Testing direct bcrypt.compare():');
    const directResult = await bcrypt.compare(testPassword, admin.password);
    console.log('Result:', directResult ? '✅ SUCCESS' : '❌ FAILED');
    
    // If direct comparison works but model doesn't, there's an issue with the model method
    if (directResult && !modelResult) {
      console.log('\n⚠️ Issue with model.comparePassword method!');
    }
    
    // If both fail, the password hash might be corrupted
    if (!directResult) {
      console.log('\n⚠️ Password hash may be corrupted. Resetting password...');
      
      // Reset password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      admin.password = hashedPassword;
      await admin.save();
      
      console.log('✅ Password reset complete');
      
      // Verify new password
      const verifyResult = await bcrypt.compare(testPassword, admin.password);
      console.log('New password verification:', verifyResult ? '✅ SUCCESS' : '❌ FAILED');
    }

    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugAuth();