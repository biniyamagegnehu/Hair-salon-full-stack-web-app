import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { queueService } from '../../services/api/queue';

export const fetchQueueStatus = createAsyncThunk(
  'queue/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await queueService.getQueueStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch queue status');
    }
  }
);

export const checkInToAppointment = createAsyncThunk(
  'queue/checkIn',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await queueService.checkIn(appointmentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in');
    }
  }
);

export const fetchQueuePosition = createAsyncThunk(
  'queue/fetchPosition',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await queueService.getQueuePosition(appointmentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch queue position');
    }
  }
);

const initialState = {
  queue: [],
  stats: {
    totalInQueue: 0,
    inProgress: 0,
    checkedIn: 0,
    confirmed: 0,
    estimatedCurrentWait: 0
  },
  userPosition: null,
  lastUpdated: null,
  isLoading: false,
  error: null
};

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    clearQueueError: (state) => {
      state.error = null;
    },
    clearUserPosition: (state) => {
      state.userPosition = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch queue status
      .addCase(fetchQueueStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQueueStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.queue = action.payload.queue;
        state.stats = action.payload.stats;
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(fetchQueueStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Check in
      .addCase(checkInToAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkInToAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the queue with new status
        const updatedAppointment = action.payload;
        const index = state.queue.findIndex(a => a._id === updatedAppointment.appointmentId);
        if (index !== -1) {
          state.queue[index].status = updatedAppointment.status;
          state.queue[index].queuePosition = updatedAppointment.queuePosition;
        }
      })
      .addCase(checkInToAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch queue position
      .addCase(fetchQueuePosition.fulfilled, (state, action) => {
        state.userPosition = action.payload;
      });
  }
});

export const { clearQueueError, clearUserPosition } = queueSlice.actions;
export default queueSlice.reducer;