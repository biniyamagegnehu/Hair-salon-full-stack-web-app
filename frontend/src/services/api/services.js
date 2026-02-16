import api from './config';

export const servicesService = {
  // Get all services
  getAllServices: async (activeOnly = true) => {
    const response = await api.get('/services', {
      params: { activeOnly }
    });
    return response.data;
  },

  // Get single service
  getServiceById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  }
};