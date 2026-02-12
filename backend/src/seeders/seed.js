require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Service = require('../models/Service');
const WorkingHour = require('../models/WorkingHour');
const SalonConfig = require('../models/SalonConfig');

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Clear existing data (except admin)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({ email: { $ne: process.env.ADMIN_EMAIL } });
    await Service.deleteMany({});
    await WorkingHour.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create test customers
    console.log('👤 Creating test customers...');
    const testCustomers = [
      {
        email: 'customer1@xsalon.com',
        phoneNumber: '+251911111111',
        fullName: 'John Doe',
        password: 'Customer123',
        role: 'CUSTOMER',
        isVerified: true
      },
      {
        email: 'customer2@xsalon.com',
        phoneNumber: '+251922222222',
        fullName: 'Jane Smith',
        password: 'Customer123',
        role: 'CUSTOMER',
        isVerified: true
      },
      {
        phoneNumber: '+251933333333',
        fullName: 'Mike Johnson',
        password: 'Customer123',
        role: 'CUSTOMER',
        isVerified: true
      }
    ];

    for (const customerData of testCustomers) {
      // Hash password manually
      const salt = await bcrypt.genSalt(10);
      customerData.password = await bcrypt.hash(customerData.password, salt);
      await User.create(customerData);
    }
    console.log('✅ Created test customers\n');

    // Create services
    console.log('💇 Creating services...');
    const services = [
      {
        name: { am: 'ሙሉ ፀጉር አሰፋፈር', en: 'Full Haircut' },
        description: { am: 'ሙሉ ፀጉር አሰፋፈር እና ማጽዳት', en: 'Complete haircut and styling' },
        price: 150,
        duration: 30
      },
      {
        name: { am: 'ፀጉር ማጭገፍ', en: 'Hair Trim' },
        description: { am: 'ፀጉር ማጭገፍ እና ማስተካከል', en: 'Hair trimming and adjustment' },
        price: 80,
        duration: 20
      },
      {
        name: { am: 'ጢስ ማርፈፍ', en: 'Beard Trim' },
        description: { am: 'ጢስ ማርፈፍ እና ማስተካከል', en: 'Beard trimming and shaping' },
        price: 50,
        duration: 15
      },
      {
        name: { am: 'ፀጉር ላይ ቀለም', en: 'Hair Coloring' },
        description: { am: 'ፀጉር ላይ ቀለም መጥለፍ', en: 'Professional hair coloring' },
        price: 300,
        duration: 60
      }
    ];

    await Service.insertMany(services);
    console.log('✅ Created services\n');

    // Create working hours
    console.log('⏰ Creating working hours...');
    const workingHours = [];
    for (let i = 0; i < 7; i++) {
      if (i === 0) {
        workingHours.push({
          dayOfWeek: i,
          openingTime: '09:00',
          closingTime: '17:00',
          isClosed: true
        });
      } else {
        workingHours.push({
          dayOfWeek: i,
          openingTime: '08:00',
          closingTime: '20:00',
          isClosed: false
        });
      }
    }

    await WorkingHour.insertMany(workingHours);
    console.log('✅ Created working hours\n');

    // Create salon config
    console.log('⚙️ Creating salon configuration...');
    const configExists = await SalonConfig.findOne();
    if (!configExists) {
      await SalonConfig.create({});
      console.log('✅ Created salon configuration\n');
    } else {
      console.log('✅ Salon configuration already exists\n');
    }

    console.log('🎉 Database seeded successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('   Admin: admin@xsalon.com / Admin@123456');
    console.log('   Customer 1: customer1@xsalon.com / Customer123');
    console.log('   Customer 2: customer2@xsalon.com / Customer123');
    console.log('   Customer 3: +251933333333 / Customer123\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seedDatabase();