const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize default data
    await initializeDefaultData();
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const initializeDefaultData = async () => {
  try {
    // Check and create default admin
    const User = require('../models/User');
    const SalonConfig = require('../models/SalonConfig');
    
    // Create default admin if not exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({
        email: process.env.ADMIN_EMAIL,
        phoneNumber: '+251900000000',
        fullName: 'System Administrator',
        password: process.env.ADMIN_PASSWORD,
        role: 'ADMIN',
        isVerified: true
      });
      console.log('Default admin user created');
    }
    
    // Create default salon config if not exists
    const configExists = await SalonConfig.findOne();
    if (!configExists) {
      await SalonConfig.create({});
      console.log('Default salon configuration created');
    }
    
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

module.exports = connectDB;