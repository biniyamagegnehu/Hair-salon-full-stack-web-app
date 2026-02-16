import api from './config';

export const authService = {
  // Register new customer
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login with credentials
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data;
  },

  // Google OAuth login
  googleLogin: async (token) => {
    const response = await api.post('/auth/google', { token });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update language preference
  updateLanguage: async (language) => {
    const response = await api.put('/auth/language', { language });
    return response.data;
  },

  // Update phone number (for Google users)
  updatePhoneNumber: async (phoneNumber) => {
    const response = await api.put('/auth/phone', { phoneNumber });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};