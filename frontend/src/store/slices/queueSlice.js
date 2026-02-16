import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { queueService } from '../../services/api/queue';

export const fetchQueueStatus = createAsyncThunk(
  'queue/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await queueService.getQueueStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
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
      return rejectWithValue(error.response?.data?.message);
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
    estimatedCurrentWait: 0,
  },
  lastUpdated: null,
  isLoading: false,
  error: null,
};

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQueueStatus.pending, (state) => {
        state.isLoading = true;
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
      .addCase(checkInToAppointment.fulfilled, (state, action) => {
        // Update local state if needed
      });
  },
});

export default queueSlice.reducer;