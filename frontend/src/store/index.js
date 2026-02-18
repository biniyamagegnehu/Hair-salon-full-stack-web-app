import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import serviceReducer from './slices/serviceSlice';
import appointmentReducer from './slices/appointmentSlice';
import queueReducer from './slices/queueSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: serviceReducer,
    appointments: appointmentReducer,
    queue: queueReducer,
    payment: paymentReducer
  },
});