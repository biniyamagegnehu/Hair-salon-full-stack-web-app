import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { queueService } from '../../services/api/queue';

// Async Thunks
export const fetchQueueStatus = createAsyncThunk(
  'queue/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await queueService.getQueueStatus();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch queue status';
      return rejectWithValue(errorMessage);
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
      const errorMessage = error.response?.data?.message || 'Failed to fetch queue position';
      return rejectWithValue(errorMessage);
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
      const errorMessage = error.response?.data?.message || 'Failed to check in';
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin Thunks
export const fetchTodayQueue = createAsyncThunk(
  'queue/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const response = await queueService.getTodayQueue();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch today\'s queue';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'queue/updateStatus',
  async ({ appointmentId, status, notes = '' }, { rejectWithValue }) => {
    try {
      const response = await queueService.updateAppointmentStatus(appointmentId, status, notes);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update appointment status';
      return rejectWithValue(errorMessage);
    }
  }
);

export const reorderQueue = createAsyncThunk(
  'queue/reorder',
  async (appointments, { rejectWithValue }) => {
    try {
      const response = await queueService.reorderQueue(appointments);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reorder queue';
      return rejectWithValue(errorMessage);
    }
  }
);

// Initial State
const initialState = {
  // Public queue data
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
  
  // Admin queue data
  todayQueue: {
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
  
  // UI State
  isLoading: false,
  error: null,
  actionLoading: false
};

// Slice
const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    clearQueueError: (state) => {
      state.error = null;
    },
    clearUserPosition: (state) => {
      state.userPosition = null;
    },
    updateQueueData: (state, action) => {
      // Update queue data from WebSocket
      state.queue = action.payload.queue || [];
      state.stats = action.payload.stats || {
        totalInQueue: 0,
        inProgress: 0,
        checkedIn: 0,
        confirmed: 0,
        estimatedCurrentWait: 0
      };
      state.lastUpdated = action.payload.lastUpdated || new Date().toISOString();
    },
    updateTodayQueueData: (state, action) => {
      // Update today's queue data from WebSocket
      if (action.payload.appointments) {
        state.todayQueue.appointments = action.payload.appointments;
      }
      if (action.payload.stats) {
        state.todayQueue.stats = action.payload.stats;
      }
    },
    resetQueueState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch Queue Status
      .addCase(fetchQueueStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQueueStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.queue = action.payload.queue || [];
        state.stats = action.payload.stats || {
          totalInQueue: 0,
          inProgress: 0,
          checkedIn: 0,
          confirmed: 0,
          estimatedCurrentWait: 0
        };
        state.lastUpdated = action.payload.lastUpdated || new Date().toISOString();
      })
      .addCase(fetchQueueStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Queue Position
      .addCase(fetchQueuePosition.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQueuePosition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosition = action.payload;
      })
      .addCase(fetchQueuePosition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Check In to Appointment
      .addCase(checkInToAppointment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(checkInToAppointment.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Update user position if returned
        if (action.payload?.queuePosition) {
          if (state.userPosition) {
            state.userPosition.position = action.payload.queuePosition;
          }
        }
      })
      .addCase(checkInToAppointment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Fetch Today's Queue (Admin)
      .addCase(fetchTodayQueue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayQueue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayQueue = {
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

      // Update Appointment Status (Admin)
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Update will come via WebSocket, but we can optimistically update
        const { appointmentId, status } = action.payload;
        
        // Update in todayQueue if present
        const updateInCategory = (category) => {
          const index = state.todayQueue.appointments[category].findIndex(
            a => a._id === appointmentId
          );
          if (index !== -1) {
            const appointment = state.todayQueue.appointments[category][index];
            
            // Remove from current category
            state.todayQueue.appointments[category].splice(index, 1);
            
            // Add to new category if applicable
            if (status === 'IN_PROGRESS') {
              state.todayQueue.appointments.inProgress.push({ ...appointment, status });
            } else if (status === 'COMPLETED') {
              // Completed appointments are removed from queue view
              // They'll be handled by history
            } else if (status === 'NO_SHOW') {
              // No-show appointments are removed from queue
            }
          }
        };

        updateInCategory('inProgress');
        updateInCategory('checkedIn');
        updateInCategory('confirmed');
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Reorder Queue (Admin)
      .addCase(reorderQueue.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(reorderQueue.fulfilled, (state) => {
        state.actionLoading = false;
        // Queue will be refreshed via WebSocket or next fetch
      })
      .addCase(reorderQueue.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const { 
  clearQueueError, 
  clearUserPosition, 
  updateQueueData,
  updateTodayQueueData,
  resetQueueState 
} = queueSlice.actions;

// Selectors
export const selectQueue = (state) => state.queue.queue;
export const selectQueueStats = (state) => state.queue.stats;
export const selectUserPosition = (state) => state.queue.userPosition;
export const selectTodayQueue = (state) => state.queue.todayQueue;
export const selectQueueLoading = (state) => state.queue.isLoading;
export const selectQueueError = (state) => state.queue.error;

export default queueSlice.reducer;