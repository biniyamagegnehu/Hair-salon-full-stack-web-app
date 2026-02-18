import api from './config';

export const appointmentsService = {
  // Get customer appointments
  getMyAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Get available slots
  getAvailableSlots: async (date, serviceId) => {
    const response = await api.get('/appointments/available-slots', {
      params: { date, serviceId }
    });
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id) => {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Reschedule appointment
  rescheduleAppointment: async (id, newDate, newTime) => {
    const response = await api.put(`/appointments/${id}/reschedule`, {
      newDate,
      newTime
    });
    return response.data;
  }
};