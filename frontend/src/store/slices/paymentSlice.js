import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentService } from '../../services/api/payment';

export const initializePayment = createAsyncThunk(
  'payment/initialize',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await paymentService.initializePayment(appointmentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment initialization failed');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await paymentService.verifyPayment(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

const initialState = {
  currentPayment: null,
  paymentUrl: null,
  transactionId: null,
  isLoading: false,
  error: null,
  paymentStatus: null
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentState: (state) => {
      state.currentPayment = null;
      state.paymentUrl = null;
      state.transactionId = null;
      state.error = null;
      state.paymentStatus = null;
    },
    clearPaymentError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize payment
      .addCase(initializePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload.appointment;
        state.paymentUrl = action.payload.paymentUrl;
        state.transactionId = action.payload.transactionId;
      })
      .addCase(initializePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = action.payload;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearPaymentState, clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;