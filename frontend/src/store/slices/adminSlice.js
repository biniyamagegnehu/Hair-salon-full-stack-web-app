import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../../services/api/admin';

// ===== DASHBOARD ACTIONS =====
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchAppointmentAnalytics = createAsyncThunk(
  'admin/fetchAppointmentAnalytics',
  async (period = 'week', { rejectWithValue }) => {
    try {
      const response = await adminService.getAppointmentAnalytics(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

// ===== CUSTOMER ACTIONS =====
export const fetchCustomers = createAsyncThunk(
  'admin/fetchCustomers',
  async ({ page = 1, limit = 20, search = '' } = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllCustomers(page, limit, search);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerDetails = createAsyncThunk(
  'admin/fetchCustomerDetails',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await adminService.getCustomerDetails(customerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer details');
    }
  }
);

export const updateCustomerStatus = createAsyncThunk(
  'admin/updateCustomerStatus',
  async ({ customerId, isActive }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateCustomerStatus(customerId, isActive);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer status');
    }
  }
);

// ===== APPOINTMENT ACTIONS =====
export const fetchAllAppointments = createAsyncThunk(
  'admin/fetchAllAppointments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllAppointments(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const fetchAppointmentDetails = createAsyncThunk(
  'admin/fetchAppointmentDetails',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await adminService.getAppointmentDetails(appointmentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment details');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'admin/updateAppointment',
  async ({ appointmentId, data }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateAppointment(appointmentId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment');
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'admin/deleteAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await adminService.deleteAppointment(appointmentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete appointment');
    }
  }
);

// ===== QUEUE ACTIONS =====
export const fetchTodayQueue = createAsyncThunk(
  'admin/fetchTodayQueue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getTodayQueue();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s queue');
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'admin/updateAppointmentStatus',
  async ({ appointmentId, status, notes = '' }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateAppointmentStatus(appointmentId, status, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment status');
    }
  }
);

export const reorderQueue = createAsyncThunk(
  'admin/reorderQueue',
  async (appointments, { rejectWithValue }) => {
    try {
      const response = await adminService.reorderQueue(appointments);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder queue');
    }
  }
);

// ===== SERVICE ACTIONS =====
export const createService = createAsyncThunk(
  'admin/createService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await adminService.createService(serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create service');
    }
  }
);

export const updateService = createAsyncThunk(
  'admin/updateService',
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateService(id, serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update service');
    }
  }
);

export const deleteService = createAsyncThunk(
  'admin/deleteService',
  async ({ id, permanent = false }, { rejectWithValue }) => {
    try {
      const response = await adminService.deleteService(id, permanent);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
    }
  }
);

export const activateService = createAsyncThunk(
  'admin/activateService',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminService.activateService(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate service');
    }
  }
);

// ===== WORKING HOURS ACTIONS =====
export const fetchWorkingHours = createAsyncThunk(
  'admin/fetchWorkingHours',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getWorkingHours();
      return response.data.workingHours;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch working hours');
    }
  }
);

export const updateWorkingHours = createAsyncThunk(
  'admin/updateWorkingHours',
  async (workingHours, { rejectWithValue }) => {
    try {
      const response = await adminService.updateWorkingHours(workingHours);
      return response.data.workingHours;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update working hours');
    }
  }
);

// ===== CONFIG ACTIONS =====
export const fetchSalonConfig = createAsyncThunk(
  'admin/fetchSalonConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getSalonConfig();
      return response.data.config;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch salon config');
    }
  }
);

export const updateSalonConfig = createAsyncThunk(
  'admin/updateSalonConfig',
  async (configData, { rejectWithValue }) => {
    try {
      const response = await adminService.updateSalonConfig(configData);
      return response.data.config;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update salon config');
    }
  }
);

// ===== REPORT ACTIONS =====
export const fetchRevenueReport = createAsyncThunk(
  'admin/fetchRevenueReport',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await adminService.getRevenueReport(startDate, endDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue report');
    }
  }
);

export const fetchAppointmentReport = createAsyncThunk(
  'admin/fetchAppointmentReport',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await adminService.getAppointmentReport(startDate, endDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment report');
    }
  }
);

export const fetchCustomerReport = createAsyncThunk(
  'admin/fetchCustomerReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getCustomerReport();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer report');
    }
  }
);

export const fetchServicePopularityReport = createAsyncThunk(
  'admin/fetchServicePopularityReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getServicePopularityReport();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service popularity report');
    }
  }
);

// ===== ADMIN SETTINGS =====
export const changeAdminPassword = createAsyncThunk(
  'admin/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await adminService.changeAdminPassword(currentPassword, newPassword);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'admin/fetchAuditLogs',
  async ({ page = 1, limit = 50 } = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAuditLogs(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch audit logs');
    }
  }
);

// Initial State
const initialState = {
  // Dashboard
  stats: {
    customers: { total: 0 },
    appointments: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      pendingPayments: 0,
      completedToday: 0
    },
    revenue: {
      today: { total: 0, advance: 0 },
      thisMonth: { total: 0 }
    },
    services: { active: 0 }
  },
  analytics: null,
  
  // Customers
  customers: {
    list: [],
    currentCustomer: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  },
  
  // Appointments
  appointments: {
    list: [],
    currentAppointment: null,
    filters: {
      status: '',
      date: '',
      customer: ''
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  },
  
  // Queue
  queue: {
    appointments: {
      inProgress: [],
      checkedIn: [],
      confirmed: []
    },
    stats: {
      total: 0,
      inProgress: 0,
      checkedIn: 0,
      confirmed: 0,
      estimatedRevenue: 0
    }
  },
  
  // Services
  services: {
    list: [],
    currentService: null
  },
  
  // Working Hours
  workingHours: [],
  
  // Salon Config
  salonConfig: null,
  
  // Reports
  reports: {
    revenue: null,
    appointments: null,
    customers: null,
    servicePopularity: null
  },
  
  // Audit Logs
  auditLogs: {
    logs: [],
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      pages: 0
    }
  },
  
  // UI State
  isLoading: false,
  actionLoading: false,
  error: null,
  successMessage: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setAppointmentFilters: (state, action) => {
      state.appointments.filters = { ...state.appointments.filters, ...action.payload };
    },
    clearCurrentCustomer: (state) => {
      state.customers.currentCustomer = null;
    },
    clearCurrentAppointment: (state) => {
      state.appointments.currentAppointment = null;
    },
    resetAdminState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // ===== DASHBOARD =====
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchAppointmentAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })

      // ===== CUSTOMERS =====
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers.list = action.payload.customers || [];
        state.customers.pagination = action.payload.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        };
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchCustomerDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers.currentCustomer = action.payload.customer;
      })
      .addCase(fetchCustomerDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateCustomerStatus.fulfilled, (state, action) => {
        // Update customer in list
        const updatedCustomer = action.payload.customer;
        const index = state.customers.list.findIndex(c => c._id === updatedCustomer._id);
        if (index !== -1) {
          state.customers.list[index] = updatedCustomer;
        }
        if (state.customers.currentCustomer?._id === updatedCustomer._id) {
          state.customers.currentCustomer = updatedCustomer;
        }
        state.successMessage = 'Customer status updated successfully';
      })

      // ===== APPOINTMENTS =====
      .addCase(fetchAllAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments.list = action.payload.appointments || [];
        state.appointments.pagination = action.payload.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        };
      })
      .addCase(fetchAllAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchAppointmentDetails.fulfilled, (state, action) => {
        state.appointments.currentAppointment = action.payload.appointment;
      })

      .addCase(updateAppointment.fulfilled, (state, action) => {
        const updatedAppointment = action.payload.appointment;
        const index = state.appointments.list.findIndex(a => a._id === updatedAppointment._id);
        if (index !== -1) {
          state.appointments.list[index] = updatedAppointment;
        }
        if (state.appointments.currentAppointment?._id === updatedAppointment._id) {
          state.appointments.currentAppointment = updatedAppointment;
        }
        state.successMessage = 'Appointment updated successfully';
      })

      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.appointments.list = state.appointments.list.filter(
          a => a._id !== action.meta.arg
        );
        state.appointments.currentAppointment = null;
        state.successMessage = 'Appointment deleted successfully';
      })

      // ===== QUEUE =====
      .addCase(fetchTodayQueue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayQueue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.queue = {
          appointments: action.payload.appointments || {
            inProgress: [],
            checkedIn: [],
            confirmed: []
          },
          stats: action.payload.stats || {
            total: 0,
            inProgress: 0,
            checkedIn: 0,
            confirmed: 0,
            estimatedRevenue: 0
          }
        };
      })
      .addCase(fetchTodayQueue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.successMessage = 'Appointment status updated successfully';
      })

      .addCase(reorderQueue.fulfilled, (state) => {
        state.successMessage = 'Queue reordered successfully';
      })

      // ===== SERVICES =====
      .addCase(createService.fulfilled, (state, action) => {
        state.services.list.push(action.payload.service);
        state.successMessage = 'Service created successfully';
      })

      .addCase(updateService.fulfilled, (state, action) => {
        const updatedService = action.payload.service;
        const index = state.services.list.findIndex(s => s._id === updatedService._id);
        if (index !== -1) {
          state.services.list[index] = updatedService;
        }
        state.successMessage = 'Service updated successfully';
      })

      .addCase(deleteService.fulfilled, (state, action) => {
        state.services.list = state.services.list.filter(
          s => s._id !== action.meta.arg.id
        );
        state.successMessage = action.meta.arg.permanent ? 
          'Service deleted permanently' : 'Service deactivated successfully';
      })

      .addCase(activateService.fulfilled, (state, action) => {
        const activatedService = action.payload.service;
        const index = state.services.list.findIndex(s => s._id === activatedService._id);
        if (index !== -1) {
          state.services.list[index] = activatedService;
        }
        state.successMessage = 'Service activated successfully';
      })

      // ===== WORKING HOURS =====
      .addCase(fetchWorkingHours.fulfilled, (state, action) => {
        state.workingHours = action.payload;
      })

      .addCase(updateWorkingHours.fulfilled, (state, action) => {
        state.workingHours = action.payload;
        state.successMessage = 'Working hours updated successfully';
      })

      // ===== SALON CONFIG =====
      .addCase(fetchSalonConfig.fulfilled, (state, action) => {
        state.salonConfig = action.payload;
      })

      .addCase(updateSalonConfig.fulfilled, (state, action) => {
        state.salonConfig = action.payload;
        state.successMessage = 'Salon configuration updated successfully';
      })

      // ===== REPORTS =====
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.reports.revenue = action.payload;
      })

      .addCase(fetchAppointmentReport.fulfilled, (state, action) => {
        state.reports.appointments = action.payload;
      })

      .addCase(fetchCustomerReport.fulfilled, (state, action) => {
        state.reports.customers = action.payload;
      })

      .addCase(fetchServicePopularityReport.fulfilled, (state, action) => {
        state.reports.servicePopularity = action.payload;
      })

      // ===== ADMIN SETTINGS =====
      .addCase(changeAdminPassword.fulfilled, (state) => {
        state.successMessage = 'Password changed successfully';
      })

      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs.logs = action.payload.logs || [];
        state.auditLogs.pagination = action.payload.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0
        };
      })

      // ===== ERROR HANDLING =====
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.actionLoading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { 
  clearAdminError, 
  clearSuccessMessage,
  setAppointmentFilters,
  clearCurrentCustomer,
  clearCurrentAppointment,
  resetAdminState 
} = adminSlice.actions;

export default adminSlice.reducer;