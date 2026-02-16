import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  services: [],
  currentService: null,
  isLoading: false,
  error: null,
};

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
});

export default serviceSlice.reducer;