require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:5000/api';

async function testAppointmentSystem() {
  try {
    console.log('📅 Testing Appointment & Queue System...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // 1. Login as customer
    console.log('\n1. Logging in as customer...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: 'customer1@xsalon.com',
      password: 'Customer123'
    }, { withCredentials: true });
    
    const customerCookies = loginRes.headers['set-cookie'];
    console.log('✅ Customer logged in:', loginRes.data.data.fullName);
    
    // 2. Get available services
    console.log('\n2. Getting available services...');
    const servicesRes = await axios.get(`${API_URL}/services`);
    const service = servicesRes.data.data.services[0];
    console.log('✅ Services retrieved:', service.name.en);
    
    // 3. Get available time slots
    console.log('\n3. Getting available time slots...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const slotsRes = await axios.get(`${API_URL}/appointments/available-slots`, {
      params: { date: dateStr, serviceId: service._id },
      headers: { Cookie: customerCookies.join('; ') },
      withCredentials: true
    });
    
    const availableSlots = slotsRes.data.data.slots.filter(s => s.available);
    if (availableSlots.length === 0) {
      console.log('⚠️ No available slots for tomorrow');
    } else {
      console.log('✅ Available slots retrieved:', availableSlots.length);
    }
    
    // 4. Create appointment (if slots available)
    if (availableSlots.length > 0) {
      console.log('\n4. Creating appointment...');
      const appointmentRes = await axios.post(`${API_URL}/appointments`, {
        serviceId: service._id,
        scheduledDate: dateStr,
        scheduledTime: availableSlots[0].time,
        notes: 'Test appointment'
      }, {
        headers: { 
          Cookie: customerCookies.join('; '),
          'x-csrf-token': 'test-csrf' // In real app, get from cookie
        },
        withCredentials: true
      });
      
      console.log('✅ Appointment created:', appointmentRes.data.data.appointment.id);
      const appointmentId = appointmentRes.data.data.appointment.id;
      
      // 5. Get customer appointments
      console.log('\n5. Getting customer appointments...');
      const appointmentsRes = await axios.get(`${API_URL}/appointments`, {
        headers: { Cookie: customerCookies.join('; ') },
        withCredentials: true
      });
      
      console.log('✅ Appointments retrieved:', appointmentsRes.data.data.appointments.length);
      
      // 6. Check queue status (public)
      console.log('\n6. Checking queue status...');
      const queueRes = await axios.get(`${API_URL}/queue/status`);
      console.log('✅ Queue status retrieved. Total in queue:', queueRes.data.data.stats.totalInQueue);
      
    }
    
    // 7. Login as admin
    console.log('\n7. Logging in as admin...');
    const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    }, { withCredentials: true });
    
    const adminCookies = adminLoginRes.headers['set-cookie'];
    console.log('✅ Admin logged in');
    
    // 8. Get admin dashboard stats
    console.log('\n8. Getting admin dashboard stats...');
    const dashboardRes = await axios.get(`${API_URL}/admin/dashboard/stats`, {
      headers: { Cookie: adminCookies.join('; ') },
      withCredentials: true
    });
    
    console.log('✅ Dashboard stats retrieved');
    console.log('   Total customers:', dashboardRes.data.data.stats.customers.total);
    console.log('   Today appointments:', dashboardRes.data.data.stats.appointments.today);
    
    // 9. Get today's queue (admin view)
    console.log('\n9. Getting today\'s queue (admin view)...');
    const todayQueueRes = await axios.get(`${API_URL}/queue/today`, {
      headers: { Cookie: adminCookies.join('; ') },
      withCredentials: true
    });
    
    console.log('✅ Today\'s queue retrieved');
    
    // 10. Get working hours
    console.log('\n10. Getting working hours...');
    const hoursRes = await axios.get(`${API_URL}/working-hours`);
    console.log('✅ Working hours retrieved for', hoursRes.data.data.workingHours.length, 'days');
    
    console.log('\n🎉 Appointment & Queue system tests completed successfully!');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAppointmentSystem();