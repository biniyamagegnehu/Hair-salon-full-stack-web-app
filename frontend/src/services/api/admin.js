import api from './config';

export const adminService = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Appointment Analytics
  getAppointmentAnalytics: async (period = 'week') => {
    const response = await api.get('/admin/dashboard/analytics', {
      params: { period }
    });
    return response.data;
  },

  // Customer Management
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

  // Service Management (Admin)
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

  // Working Hours Management
  getWorkingHours: async () => {
    const response = await api.get('/working-hours');
    return response.data;
  },

  updateWorkingHours: async (workingHours) => {
    const response = await api.put('/working-hours', workingHours);
    return response.data;
  },

  // Salon Configuration
  getSalonConfig: async () => {
    const response = await api.get('/admin/config');
    return response.data;
  },

  updateSalonConfig: async (configData) => {
    const response = await api.put('/admin/config', configData);
    return response.data;
  },

  // Admin Password Change
  changeAdminPassword: async (currentPassword, newPassword) => {
    const response = await api.put('/admin/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};