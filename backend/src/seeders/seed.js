require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Service = require('../models/Service');
const WorkingHour = require('../models/WorkingHour');
const SalonConfig = require('../models/SalonConfig');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany({ email: { $ne: process.env.ADMIN_EMAIL } });
    await Service.deleteMany({});
    await WorkingHour.deleteMany({});
    
    console.log('Cleared existing data');

    // Create test customers
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
      const salt = await bcrypt.genSalt(10);
      customerData.password = await bcrypt.hash(customerData.password, salt);
      await User.create(customerData);
    }
    console.log('Created test customers');

    // Create services
    const services = [
      {
        name: {
          am: 'ሙሉ ፀጉር አሰፋፈር',
          en: 'Full Haircut'
        },
        description: {
          am: 'ሙሉ ፀጉር አሰፋፈር እና ማጽዳት',
          en: 'Complete haircut and styling'
        },
        price: 150,
        duration: 30
      },
      {
        name: {
          am: 'ፀጉር ማጭገፍ',
          en: 'Hair Trim'
        },
        description: {
          am: 'ፀጉር ማጭገፍ እና ማስተካከል',
          en: 'Hair trimming and adjustment'
        },
        price: 80,
        duration: 20
      },
      {
        name: {
          am: 'ጢስ ማርፈፍ',
          en: 'Beard Trim'
        },
        description: {
          am: 'ጢስ ማርፈፍ እና ማስተካከል',
          en: 'Beard trimming and shaping'
        },
        price: 50,
        duration: 15
      },
      {
        name: {
          am: 'ፀጉር ላይ ቀለም',
          en: 'Hair Coloring'
        },
        description: {
          am: 'ፀጉር ላይ ቀለም መጥለፍ',
          en: 'Professional hair coloring'
        },
        price: 300,
        duration: 60
      }
    ];

    await Service.insertMany(services);
    console.log('Created services');

    // Create working hours (Monday to Saturday)
    const workingHours = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      if (i === 0) { // Sunday closed
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
    console.log('Created working hours');

    // Ensure salon config exists
    const configExists = await SalonConfig.findOne();
    if (!configExists) {
      await SalonConfig.create({});
      console.log('Created salon configuration');
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin:', process.env.ADMIN_EMAIL, '/', process.env.ADMIN_PASSWORD);
    console.log('Customer 1:', 'customer1@xsalon.com / Customer123');
    console.log('Customer 2:', 'customer2@xsalon.com / Customer123');
    console.log('Customer 3:', '+251933333333 / Customer123');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();