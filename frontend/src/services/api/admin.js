import api from './config';

export const adminService = {
  // ===== DASHBOARD STATISTICS =====
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getAppointmentAnalytics: async (period = 'week') => {
    const response = await api.get('/admin/dashboard/analytics', {
      params: { period }
    });
    return response.data;
  },

  // ===== CUSTOMER MANAGEMENT =====
  getAllCustomers: async (page = 1, limit = 20, search = '') => {
    const response = await api.get('/admin/customers', {
      params: { page, limit, search }
    });
    return response.data;
  },

  getCustomerDetails: async (customerId) => {
    const response = await api.get(`/admin/customers/${customerId}`);
    return response.data;
  },

  updateCustomerStatus: async (customerId, isActive) => {
    const response = await api.put(`/admin/customers/${customerId}/status`, { isActive });
    return response.data;
  },

  // ===== APPOINTMENT MANAGEMENT =====
  getAllAppointments: async (filters = {}) => {
    const response = await api.get('/admin/appointments', { params: filters });
    return response.data;
  },

  getAppointmentDetails: async (appointmentId) => {
    const response = await api.get(`/admin/appointments/${appointmentId}`);
    return response.data;
  },

  updateAppointment: async (appointmentId, data) => {
    const response = await api.put(`/admin/appointments/${appointmentId}`, data);
    return response.data;
  },

  deleteAppointment: async (appointmentId) => {
    const response = await api.delete(`/admin/appointments/${appointmentId}`);
    return response.data;
  },

  // ===== QUEUE MANAGEMENT =====
  getTodayQueue: async () => {
    const response = await api.get('/queue/today');
    return response.data;
  },

  updateAppointmentStatus: async (appointmentId, status, notes = '') => {
    const response = await api.put(`/queue/${appointmentId}/status`, { status, notes });
    return response.data;
  },

  reorderQueue: async (appointments) => {
    const response = await api.put('/queue/reorder', { appointments });
    return response.data;
  },

  // ===== SERVICE MANAGEMENT =====
  createService: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  updateService: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },

  deleteService: async (id, permanent = false) => {
    const response = await api.delete(`/services/${id}`, {
      params: { permanent }
    });
    return response.data;
  },

  activateService: async (id) => {
    const response = await api.put(`/services/${id}/activate`);
    return response.data;
  },

  // ===== WORKING HOURS MANAGEMENT =====
  getWorkingHours: async () => {
    const response = await api.get('/working-hours');
    return response.data;
  },

  updateWorkingHours: async (workingHours) => {
    const response = await api.put('/working-hours', workingHours);
    return response.data;
  },

  // ===== SALON CONFIGURATION =====
  getSalonConfig: async () => {
    const response = await api.get('/admin/config');
    return response.data;
  },

  updateSalonConfig: async (configData) => {
    const response = await api.put('/admin/config', configData);
    return response.data;
  },

  // ===== REPORTS & ANALYTICS =====
  getRevenueReport: async (startDate, endDate) => {
    const response = await api.get('/admin/reports/revenue', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getAppointmentReport: async (startDate, endDate) => {
    const response = await api.get('/admin/reports/appointments', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getCustomerReport: async () => {
    const response = await api.get('/admin/reports/customers');
    return response.data;
  },

  getServicePopularityReport: async () => {
    const response = await api.get('/admin/reports/service-popularity');
    return response.data;
  },

  // ===== ADMIN SETTINGS =====
  changeAdminPassword: async (currentPassword, newPassword) => {
    const response = await api.put('/admin/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  getAuditLogs: async (page = 1, limit = 50) => {
    const response = await api.get('/admin/audit-logs', {
      params: { page, limit }
    });
    return response.data;
  }
};