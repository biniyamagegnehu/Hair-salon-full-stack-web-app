import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentsService } from '../../services/api/appointments';

// Create appointment
export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentsService.createAppointment(appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create appointment');
    }
  }
);

// Fetch my appointments
export const fetchMyAppointments = createAsyncThunk(
  'appointments/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentsService.getMyAppointments();
      return response.data.appointments || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

// Cancel appointment
export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await appointmentsService.cancelAppointment(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

const initialState = {
  appointments: [],
  currentAppointment: null,
  isLoading: false,
  error: null
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearAppointmentError: (state) => {
      state.error = null;
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAppointment = action.payload.appointment;
        // Add to appointments list if needed
        if (action.payload.appointment) {
          state.appointments = [action.payload.appointment, ...state.appointments];
        }
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch appointments
      .addCase(fetchMyAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Cancel appointment
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        // Update the appointment status in the list
        const index = state.appointments.findIndex(apt => apt.id === action.payload.appointmentId);
        if (index !== -1) {
          state.appointments[index].status = 'CANCELLED';
        }
      });
  }
});

export const { clearAppointmentError, clearCurrentAppointment } = appointmentSlice.actions;
export default appointmentSlice.reducer;