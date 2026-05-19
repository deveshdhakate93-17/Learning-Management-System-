import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  logoutUser,
  getMe,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  clearError,
  setOtpEmail,
  setOtpPurpose,
} from '../store/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);

  const handleRegister = useCallback(async (data) => {
    try {
      const result = await dispatch(registerUser(data)).unwrap();
      dispatch(setOtpEmail(result.email));
      dispatch(setOtpPurpose('email_verification'));
      toast('Verification code sent to your email', { icon: 'ℹ️' });
      navigate('/verify-otp');
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  }, [dispatch, navigate]);

  const handleVerifyOTP = useCallback(async (data) => {
    try {
      await dispatch(verifyOTP(data)).unwrap();
      toast.success('Email verified! Welcome to LMS 🎉');
      navigate('/courses');
    } catch (err) {
      toast.error(err || 'OTP verification failed');
    }
  }, [dispatch, navigate]);

  const handleResendOTP = useCallback(async (data) => {
    try {
      await dispatch(resendOTP(data)).unwrap();
      toast('New code sent to your email', { icon: 'ℹ️' });
    } catch (err) {
      toast.error(err || 'Failed to resend OTP');
    }
  }, [dispatch]);

  const handleLogin = useCallback(async (data) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      toast.success(`Welcome back, ${result.user?.fullName?.split(' ')[0] || 'User'}!`);
      navigate('/courses');
    } catch (err) {
      if (err?.includes?.('locked')) {
        toast.error('Account locked. Try again in 15 minutes.', { icon: '⚠️' });
      } else {
        toast.error(err || 'Invalid email or password');
      }
    }
  }, [dispatch, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast("You've been signed out.", { icon: 'ℹ️' });
      navigate('/login');
    } catch {
      toast.error('Sign out failed. Please try again.');
    }
  }, [dispatch, navigate]);

  const handleForgotPassword = useCallback(async (data) => {
    try {
      const result = await dispatch(forgotPassword(data)).unwrap();
      dispatch(setOtpEmail(result.email));
      dispatch(setOtpPurpose('password_reset'));
      toast('Reset code sent to your email', { icon: 'ℹ️' });
      navigate('/forgot-password/verify');
    } catch (err) {
      toast.error(err || 'Failed to send reset code');
    }
  }, [dispatch, navigate]);

  const handleVerifyResetOTP = useCallback(async (data) => {
    try {
      await dispatch(verifyResetOTP(data)).unwrap();
      toast.success('OTP verified! Set your new password.');
      navigate('/forgot-password/reset');
    } catch (err) {
      toast.error(err || 'OTP verification failed');
    }
  }, [dispatch, navigate]);

  const handleResetPassword = useCallback(async (data) => {
    try {
      await dispatch(resetPassword(data)).unwrap();
      toast.success('Password updated! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err || 'Password reset failed');
    }
  }, [dispatch, navigate]);

  const fetchMe = useCallback(() => dispatch(getMe()), [dispatch]);
  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    ...auth,
    handleRegister,
    handleVerifyOTP,
    handleResendOTP,
    handleLogin,
    handleLogout,
    handleForgotPassword,
    handleVerifyResetOTP,
    handleResetPassword,
    fetchMe,
    clearAuthError,
  };
};

export default useAuth;
