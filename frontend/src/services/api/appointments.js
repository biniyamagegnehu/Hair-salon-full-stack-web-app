import api from './config';

export const appointmentsService = {
  // Get available time slots
  getAvailableSlots: async (date, serviceId) => {
    const response = await api.get('/appointments/available-slots', {
      params: { date, serviceId },
    });
    return response.data;
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Get customer appointments
  getMyAppointments: async (params = {}) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  // Get single appointment
  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id) => {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data;
  },

  // Reschedule appointment
  rescheduleAppointment: async (id, newDate, newTime) => {
    const response = await api.put(`/appointments/${id}/reschedule`, {
      newDate,
      newTime,
    });
    return response.data;
  },
};