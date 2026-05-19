import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';

const user = JSON.parse(localStorage.getItem('lms_user'));
const token = localStorage.getItem('lms_token');

// Thunks
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try { return await authService.register(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async (data, { rejectWithValue }) => {
  try { return await authService.verifyOTP(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'OTP verification failed'); }
});

export const resendOTP = createAsyncThunk('auth/resendOTP', async (data, { rejectWithValue }) => {
  try { return await authService.resendOTP(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to resend OTP'); }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try { return await authService.login(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try { return await authService.logout(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Logout failed'); }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try { return await authService.getMe(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to get profile'); }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (data, { rejectWithValue }) => {
  try { return await authService.forgotPassword(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to send reset OTP'); }
});

export const verifyResetOTP = createAsyncThunk('auth/verifyResetOTP', async (data, { rejectWithValue }) => {
  try { return await authService.verifyResetOTP(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'OTP verification failed'); }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (data, { rejectWithValue }) => {
  try { return await authService.resetPassword(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Password reset failed'); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user || null,
    token: token || null,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
    otpEmail: null,
    resetToken: null,
    otpPurpose: null,
  },
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('lms_user');
      localStorage.removeItem('lms_token');
    },
    clearError: (state) => { state.error = null; },
    setOtpEmail: (state, action) => { state.otpEmail = action.payload; },
    setOtpPurpose: (state, action) => { state.otpPurpose = action.payload; },
    setToken: (state, action) => { state.token = action.payload; },

    // ✅ OAuth ke liye naya reducer
    setOAuthUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('lms_user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (s) => { s.isLoading = true; s.error = null; });
    builder.addCase(registerUser.fulfilled, (s, a) => { s.isLoading = false; s.otpEmail = a.payload.email; });
    builder.addCase(registerUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
    // Verify OTP
    builder.addCase(verifyOTP.pending, (s) => { s.isLoading = true; s.error = null; });
    builder.addCase(verifyOTP.fulfilled, (s, a) => {
      s.isLoading = false;
      s.user = a.payload.user;
      s.token = a.payload.token;
      s.isAuthenticated = true;
      localStorage.setItem('lms_user', JSON.stringify(a.payload.user));
      localStorage.setItem('lms_token', a.payload.token);
    });
    builder.addCase(verifyOTP.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
    // Login
    builder.addCase(loginUser.pending, (s) => { s.isLoading = true; s.error = null; });
    builder.addCase(loginUser.fulfilled, (s, a) => {
      s.isLoading = false;
      s.user = a.payload.user;
      s.token = a.payload.token;
      s.isAuthenticated = true;
      localStorage.setItem('lms_user', JSON.stringify(a.payload.user));
      localStorage.setItem('lms_token', a.payload.token);
    });
    builder.addCase(loginUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
    // Logout
    builder.addCase(logoutUser.fulfilled, (s) => {
      s.user = null; s.token = null; s.isAuthenticated = false;
      localStorage.removeItem('lms_user'); localStorage.removeItem('lms_token');
    });
    // GetMe
    builder.addCase(getMe.pending, (s) => { s.isLoading = true; });
    builder.addCase(getMe.fulfilled, (s, a) => {
      s.isLoading = false;
      s.user = a.payload;
      s.isAuthenticated = true; // ✅ getMe ke baad bhi authenticated set karo
    });
    builder.addCase(getMe.rejected, (s) => { s.isLoading = false; });
    // Forgot Password
    builder.addCase(forgotPassword.pending, (s) => { s.isLoading = true; s.error = null; });
    builder.addCase(forgotPassword.fulfilled, (s, a) => { s.isLoading = false; s.otpEmail = a.payload.email; });
    builder.addCase(forgotPassword.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
    // Reset Password
    builder.addCase(resetPassword.pending, (s) => { s.isLoading = true; s.error = null; });
    builder.addCase(resetPassword.fulfilled, (s) => { s.isLoading = false; s.resetToken = null; });
    builder.addCase(resetPassword.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
    // Resend OTP
    builder.addCase(resendOTP.pending, (s) => { s.isLoading = true; s.error = null; });
    builder.addCase(resendOTP.fulfilled, (s) => { s.isLoading = false; });
    builder.addCase(resendOTP.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
  },
});

// ✅ setOAuthUser export mein add kiya
export const { clearAuth, clearError, setOtpEmail, setOtpPurpose, setToken, setOAuthUser } = authSlice.actions;
export default authSlice.reducer;