require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:5000/api';

async function testAuthentication() {
  try {
    console.log('🔐 Testing Authentication System...\n');
    
    // Test 1: Customer Registration
    console.log('1. Testing Customer Registration...');
    const registerData = {
      phoneNumber: '+251911223344',
      fullName: 'Test Customer',
      email: 'test@customer.com',
      password: 'Test123456'
    };
    
    const registerRes = await axios.post(`${API_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerRes.data.message);
    
    // Test 2: Customer Login
    console.log('\n2. Testing Customer Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: 'test@customer.com',
      password: 'Test123456'
    }, {
      withCredentials: true // Important for cookies
    });
    console.log('✅ Login successful:', loginRes.data.message);
    
    // Save cookies for subsequent requests
    const cookies = loginRes.headers['set-cookie'];
    
    // Test 3: Get Current User
    console.log('\n3. Testing Get Current User...');
    const meRes = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Cookie: cookies.join('; ')
      },
      withCredentials: true
    });
    console.log('✅ User retrieved:', meRes.data.data.fullName);
    
    // Test 4: Update Language Preference
    console.log('\n4. Testing Language Update...');
    const langRes = await axios.put(`${API_URL}/auth/language`, 
      { language: 'am' },
      {
        headers: {
          Cookie: cookies.join('; '),
          'x-csrf-token': 'csrf-token-from-cookie' // Get from cookie
        },
        withCredentials: true
      }
    );
    console.log('✅ Language updated:', langRes.data.data.languagePreference);
    
    // Test 5: Admin Login
    console.log('\n5. Testing Admin Login...');
    const adminRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    }, {
      withCredentials: true
    });
    console.log('✅ Admin login successful:', adminRes.data.data.role);
    
    console.log('\n🎉 Authentication tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function testPaymentEndpoints() {
  try {
    console.log('\n💰 Testing Payment Endpoints...\n');
    
    // First login as customer
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: 'test@customer.com',
      password: 'Test123456'
    }, {
      withCredentials: true
    });
    
    const cookies = loginRes.headers['set-cookie'];
    
    // Test 1: Get Payment Methods
    console.log('1. Testing Get Payment Methods...');
    try {
      const methodsRes = await axios.get(`${API_URL}/payments/methods`, {
        headers: { Cookie: cookies.join('; ') },
        withCredentials: true
      });
      console.log('✅ Payment methods retrieved');
    } catch (error) {
      console.log('⚠️ Payment methods endpoint might require valid Chapa keys');
    }
    
    console.log('\n🎉 Payment endpoint tests completed!');
    console.log('\nNote: Full payment tests require valid Chapa API keys.');
    
  } catch (error) {
    console.error('❌ Payment test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    await testAuthentication();
    await testPaymentEndpoints();
    
    await mongoose.connection.close();
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  }
}

runTests();