require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:5000/api';

async function testPaymentEndpoint() {
  try {
    console.log('💳 Testing Payment Initialization Endpoint...\n');
    
    // Connect to database to clean up or verify later if needed
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // 1. Register/Login as customer
    console.log('\n1. Registering/Logging in as customer...');
    let loginRes;
    try {
      loginRes = await axios.post(`${API_URL}/auth/register`, {
        fullName: 'Test Customer',
        email: `test.user${Math.floor(Date.now() / 1000)}@gmail.com`,
        phoneNumber: `+25191${Math.floor(1000000 + Math.random() * 9000000)}`,
        password: 'Customer123A!'
      }, { withCredentials: true });
    } catch (e) {
      if (e.response?.data?.message?.includes('already exists')) {
        loginRes = await axios.post(`${API_URL}/auth/login`, {
          identifier: 'customer1@xsalon.com',
          password: 'Customer123'
        }, { withCredentials: true });
      } else {
        console.error('Validation Errors:', JSON.stringify(e.response?.data, null, 2));
        throw e;
      }
    }
    
    const customerCookies = loginRes.headers['set-cookie'];
    console.log('✅ Customer logged in:', loginRes.data.data.fullName);
    
    // 2. Get available services
    const servicesRes = await axios.get(`${API_URL}/services`);
    const service = servicesRes.data.data.services[0];
    
    // 3. Get available time slots
    let availableSlots = [];
    let dateStr = '';
    
    for (let i = 1; i <= 7; i++) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + i);
      dateStr = tomorrow.toISOString().split('T')[0];
      
      const slotsRes = await axios.get(`${API_URL}/appointments/available-slots`, {
        params: { date: dateStr, serviceId: service._id },
        headers: { Cookie: customerCookies.join('; ') },
        withCredentials: true
      });
      
      availableSlots = slotsRes.data.data.slots.filter(s => s.available);
      if (availableSlots.length > 0) break;
    }
    
    if (availableSlots.length === 0) {
      console.log('⚠️ No available slots found in the next 7 days');
      process.exit(1);
    }
    
    // 4. Create appointment
    console.log('\n2. Creating test appointment...');
    const appointmentRes = await axios.post(`${API_URL}/appointments`, {
      serviceId: service._id,
      scheduledDate: dateStr,
      scheduledTime: availableSlots[0].time,
      notes: 'Test payment appointment'
    }, {
      headers: { Cookie: customerCookies.join('; ') },
      withCredentials: true
    });
    
    const appointmentId = appointmentRes.data.data.appointment.id || appointmentRes.data.data.appointment._id;
    console.log('✅ Appointment created with ID:', appointmentId);
    
    // 5. Initialize Payment
    console.log('\n3. Initializing payment...');
    const paymentRes = await axios.post(`${API_URL}/payments/initialize`, {
      appointmentId: appointmentId
    }, {
      headers: { Cookie: customerCookies.join('; ') },
      withCredentials: true
    });
    
    console.log('✅ Payment initialized successfully!');
    console.log('Checkout URL:', paymentRes.data.data.paymentUrl);
    console.log('Transaction ID:', paymentRes.data.data.transactionId);
    console.log('Advance Amount:', paymentRes.data.data.advanceAmount);
    
    console.log('\n🎉 Payment Integration Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testPaymentEndpoint();
