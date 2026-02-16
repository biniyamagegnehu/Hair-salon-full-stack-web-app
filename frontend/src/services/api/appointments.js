import api from './config';

export const appointmentsService = {
  // Get available time slots
  getAvailableSlots: async (date, serviceId) => {
    const response = await api.get('/appointments/available-slots', {
      params: { date, serviceId }
    });
    return response.data;
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Get customer appointments
  getMyAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  }
};