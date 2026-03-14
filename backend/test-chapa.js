require('dotenv').config();
const chapaService = require('./src/services/chapaService');

async function testChapa() {
  console.log('Testing Chapa API Connection...');
  console.log('Secret Key exists:', !!process.env.CHAPA_SECRET_KEY);
  console.log('Public Key exists:', !!process.env.CHAPA_PUBLIC_KEY);

  try {
    const paymentData = chapaService.formatPaymentData({
      amount: "100",
      email: "test.user@gmail.com",
      first_name: "Test",
      last_name: "User",
      callback_url: "http://localhost:5000/api/payments/webhook",
      return_url: "http://localhost:5173/payment-callback",
      customization: {
        title: "Test Payment",
        description: "Testing API connection"
      }
    });

    console.log('Sending this data to Chapa:', paymentData);

    console.log('Initializing transaction...');
    const initResponse = await chapaService.initializeTransaction(paymentData);
    
    if (initResponse.success) {
      console.log('✅ Initialization successful!');
      console.log('Checkout URL:', initResponse.data.data.checkout_url);
      console.log('Transaction Ref:', paymentData.tx_ref);

      // We can't verify an uncompleted transaction fully, but we can check if the endpoint responds
      console.log('\nTesting transaction verification...');
      const verifyResponse = await chapaService.verifyTransaction(paymentData.tx_ref);
      
      console.log('Verification Response:', verifyResponse);
    } else {
      console.error('❌ Initialization failed:', initResponse.error);
    }

  } catch (error) {
    console.error('❌ test script error:', error);
  }
}

testChapa();
