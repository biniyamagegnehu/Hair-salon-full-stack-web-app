const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function recreateAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', require('./src/models/User').schema);
    
    // Delete existing admin
    await User.deleteOne({ email: 'admin@xsalon.com' });
    console.log('✅ Deleted existing admin');

    // Create new admin - let the pre-save hook hash the password
    const admin = new User({
      email: 'admin@xsalon.com',
      phoneNumber: '+251911000000',
      fullName: 'System Administrator',
      password: 'Admin@123456', // Will be hashed by pre-save hook
      role: 'ADMIN',
      isVerified: true
    });

    await admin.save();
    console.log('✅ Admin created successfully');

    // Test login
    const testUser = await User.findOne({ email: 'admin@xsalon.com' });
    const isValid = await testUser.comparePassword('Admin@123456');
    console.log('Login test:', isValid ? '✅ SUCCESS' : '❌ FAILED');

    if (isValid) {
      console.log('\n🎉 Admin login working!');
      console.log('Email: admin@xsalon.com');
      console.log('Password: Admin@123456');
    }

    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

recreateAdmin();