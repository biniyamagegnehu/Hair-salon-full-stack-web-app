require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');

async function testWebhook() {
  const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('CHAPA_WEBHOOK_SECRET is not set in .env');
    process.exit(1);
  }

  // Define a mock payload (mimicking what Chapa sends)
  // Must be stringified because that's what we hash
  const payloadData = {
    event: 'charge.success',
    tx_ref: 'TEST-TX-12345678',
    reference: 'TEST-TX-12345678',
    status: 'success',
    amount: '100',
    currency: 'ETB',
    email: 'test@example.com'
  };
  
  const rawPayload = JSON.stringify(payloadData);
  
  // Create signature the exact same way Chapa does
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const signature = hmac.update(rawPayload).digest('hex');
  
  console.log('Sending mock webhook...');
  console.log('Payload:', rawPayload);
  console.log('Generated Signature:', signature);
  
  try {
    const response = await axios.post('http://localhost:5000/api/payments/webhook', rawPayload, {
      headers: {
        'Content-Type': 'application/json',
        'chapa-signature': signature
      }
    });
    
    console.log('\n✅ Webhook Test Success: expected 200 response');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('\n❌ Webhook Test Failed:', error.response?.status, error.response?.data || error.message);
  }
}

testWebhook();
