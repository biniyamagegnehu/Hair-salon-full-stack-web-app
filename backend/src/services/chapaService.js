const axios = require('axios');
const crypto = require('crypto');
const ApiResponse = require('../utils/response');

class ChapaService {
  constructor() {
    this.baseURL = 'https://api.chapa.co/v1';
    this.secretKey = process.env.CHAPA_SECRET_KEY;
    this.publicKey = process.env.CHAPA_PUBLIC_KEY;
    this.webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;
  }

  // Initialize transaction
  async initializeTransaction(transactionData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        transactionData,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const responseData = error.response?.data;
      let errorMessage = 'Payment initialization failed';

      if (responseData) {
        if (typeof responseData.message === 'string') {
          errorMessage = responseData.message;
        } else if (typeof responseData.message === 'object') {
          errorMessage = Object.values(responseData.message).flat().join(', ');
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      }

      console.error('Chapa initialization error:', responseData || error.message);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Verify transaction
  async verifyTransaction(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const responseData = error.response?.data;
      let errorMessage = 'Transaction verification failed';

      if (responseData) {
        if (typeof responseData.message === 'string') {
          errorMessage = responseData.message;
        } else if (typeof responseData.message === 'object') {
          errorMessage = Object.values(responseData.message).flat().join(', ');
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      }

      console.error('Chapa verification error:', responseData || error.message);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Generate unique transaction reference
  generateTransactionReference() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `XHAIR-${timestamp}-${random}`;
  }

  // Verify webhook signature
  verifyWebhookSignature(signature, rawBody) {
    try {
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      const digest = hmac.update(rawBody).digest('hex');
      return signature === digest;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  // Format payment data for Chapa
  formatPaymentData(paymentInfo) {
    const {
      amount,
      currency = 'ETB',
      email,
      phone_number,
      first_name,
      last_name,
      tx_ref,
      callback_url,
      return_url,
      customization = {}
    } = paymentInfo;

    return {
      amount,
      currency,
      email,
      phone_number: phone_number || '251900000000',
      first_name: first_name || 'Customer',
      last_name: last_name || 'XSalon',
      tx_ref: tx_ref || this.generateTransactionReference(),
      callback_url,
      return_url,
      customization: {
        title: customization.title || 'X Men\'s Hair Salon',
        description: customization.description || 'Advance payment for appointment',
        logo: customization.logo || 'https://xsalony.com/logo.png'
      }
    };
  }

  // Refund transaction
  async refundTransaction(transactionId, amount = null) {
    try {
      const payload = {};
      if (amount) {
        payload.amount = amount.toString();
      }

      const response = await axios.post(
        `${this.baseURL}/refund/${transactionId}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const responseData = error.response?.data;
      let errorMessage = 'Refund failed';

      if (responseData) {
        if (typeof responseData.message === 'string') {
          errorMessage = responseData.message;
        } else if (typeof responseData.message === 'object') {
          errorMessage = Object.values(responseData.message).flat().join(', ');
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      }

      console.error('Chapa refund error:', responseData || error.message);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await axios.get(
        `${this.baseURL}/payment-methods`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get payment methods error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch payment methods'
      };
    }
  }
}

module.exports = new ChapaService();