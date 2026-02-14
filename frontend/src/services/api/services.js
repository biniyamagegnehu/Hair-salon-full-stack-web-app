import api from './config';

export const servicesService = {
  // Get all services
  getAllServices: async (activeOnly = true) => {
    const response = await api.get('/services', {
      params: { activeOnly },
    });
    return response.data;
  },

  // Get single service
  getServiceById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  // Create service (admin only)
  createService: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  // Update service (admin only)
  updateService: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },

  // Delete/deactivate service (admin only)
  deleteService: async (id, permanent = false) => {
    const response = await api.delete(`/services/${id}`, {
      params: { permanent },
    });
    return response.data;
  },

  // Activate service (admin only)
  activateService: async (id) => {
    const response = await api.put(`/services/${id}/activate`);
    return response.data;
  },
};