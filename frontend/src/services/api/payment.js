import api from './config';

export const paymentService = {
  // Initialize payment for an appointment
  initializePayment: async (appointmentId) => {
    const response = await api.post('/payments/initialize', { appointmentId });
    return response.data;
  },

  // Verify payment status
  verifyPayment: async (transactionId) => {
    const response = await api.get(`/payments/verify/${transactionId}`);
    return response.data;
  },

  // Get available payment methods
  getPaymentMethods: async () => {
    const response = await api.get('/payments/methods');
    return response.data;
  },

  // Complete payment at salon (admin only)
  completePayment: async (appointmentId, amountPaid, paymentMethod = 'CASH') => {
    const response = await api.post(`/payments/complete/${appointmentId}`, {
      amountPaid,
      paymentMethod
    });
    return response.data;
  }
};