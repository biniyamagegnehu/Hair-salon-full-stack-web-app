import api from './config';

export const queueService = {
  // Get public queue status
  getQueueStatus: async () => {
    const response = await api.get('/queue/status');
    return response.data;
  },

  // Get queue position for a specific appointment
  getQueuePosition: async (appointmentId) => {
    const response = await api.get(`/queue/position/${appointmentId}`);
    return response.data;
  },

  // Check in to appointment
  checkIn: async (appointmentId) => {
    const response = await api.post(`/queue/${appointmentId}/check-in`);
    return response.data;
  },

  // Admin: Get today's queue
  getTodayQueue: async () => {
    const response = await api.get('/queue/today');
    return response.data;
  },

  // Admin: Update appointment status
  updateAppointmentStatus: async (appointmentId, status, notes = '') => {
    const response = await api.put(`/queue/${appointmentId}/status`, { status, notes });
    return response.data;
  },

  // Admin: Reorder queue
  reorderQueue: async (appointments) => {
    const response = await api.put('/queue/reorder', { appointments });
    return response.data;
  }
};