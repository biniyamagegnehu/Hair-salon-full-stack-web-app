import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/api/auth';

// Regular login
export const login = createAsyncThunk(
  'auth/login',
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(identifier, password);
      return response.data;
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Google login
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(token);
      return response.data;
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Google login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Logout failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response && error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Failed to get user');
    }
  }
);

// Update phone number (for Google users)
export const updatePhoneNumber = createAsyncThunk(
  'auth/updatePhoneNumber',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const response = await authService.updatePhoneNumber(phoneNumber);
      return response.data;
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Failed to update phone';
      return rejectWithValue(errorMessage);
    }
  }
);

// Update language preference
export const updateLanguage = createAsyncThunk(
  'auth/updateLanguage',
  async (language, { rejectWithValue }) => {
    try {
      const response = await authService.updateLanguage(language);
      return response.data;
    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Failed to update language';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requiresPhoneUpdate: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRequiresPhoneUpdate: (state, action) => {
      state.requiresPhoneUpdate = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.requiresPhoneUpdate = action.payload && action.payload.requiresPhoneUpdate 
          ? action.payload.requiresPhoneUpdate 
          : false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.requiresPhoneUpdate = action.payload && action.payload.requiresPhoneUpdate 
          ? action.payload.requiresPhoneUpdate 
          : false;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.requiresPhoneUpdate = false;
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // Update phone number
      .addCase(updatePhoneNumber.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePhoneNumber.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.phoneNumber = action.payload.phoneNumber;
        }
        state.requiresPhoneUpdate = false;
      })
      .addCase(updatePhoneNumber.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update language
      .addCase(updateLanguage.fulfilled, (state, action) => {
        if (state.user) {
          state.user.languagePreference = action.payload.languagePreference;
        }
      });
  }
});

export const { clearError, setRequiresPhoneUpdate } = authSlice.actions;
export default authSlice.reducer;