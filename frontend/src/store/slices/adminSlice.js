import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../../services/api/admin';

// Dashboard Stats
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

// Appointment Analytics
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

// Customers
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

// Working Hours
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

// Salon Config
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

const initialState = {
  stats: {
    customers: { total: 0 },
    appointments: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      pendingPayments: 0
    },
    revenue: {
      today: { total: 0, advance: 0 },
      thisMonth: { total: 0 }
    },
    services: { active: 0 }
  },
  analytics: null,
  customers: {
    list: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  },
  workingHours: [],
  salonConfig: null,
  isLoading: false,
  error: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
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

      // Analytics
      .addCase(fetchAppointmentAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })

      // Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers.list = action.payload.customers;
        state.customers.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Working Hours
      .addCase(fetchWorkingHours.fulfilled, (state, action) => {
        state.workingHours = action.payload;
      })
      .addCase(updateWorkingHours.fulfilled, (state, action) => {
        state.workingHours = action.payload;
      })

      // Salon Config
      .addCase(fetchSalonConfig.fulfilled, (state, action) => {
        state.salonConfig = action.payload;
      })
      .addCase(updateSalonConfig.fulfilled, (state, action) => {
        state.salonConfig = action.payload;
      });
  }
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;