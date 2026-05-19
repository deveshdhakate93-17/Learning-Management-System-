import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/auth/AuthLayout';
import OTPInput from '../../components/auth/OTPInput';
import { verifyOTP, resendOTP } from '../../store/authSlice';

const TIMER_SECONDS = 180; // 3 minutes
const MAX_RESENDS = 3;

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [resendCount, setResendCount] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { otpEmail, isLoading } = useSelector((s) => s.auth);
  const isForgot = location.pathname.includes('forgot-password');

  useEffect(() => {
    if (!otpEmail) navigate(isForgot ? '/forgot-password' : '/register');
  }, [otpEmail, navigate, isForgot]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleVerify = async (code) => {
    setOtp(code);
    try {
      if (isForgot) {
        await dispatch(verifyOTP({ email: otpEmail, otp: code, purpose: 'password_reset' })).unwrap();
        toast.success('OTP verified!');
        navigate('/forgot-password/reset');
      } else {
        await dispatch(verifyOTP({ email: otpEmail, otp: code, purpose: 'email_verification' })).unwrap();
        toast.success('Email verified! Welcome to LMS 🎉');
        navigate('/courses');
      }
    } catch (err) {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 600);
      toast.error(err || 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resendCount >= MAX_RESENDS) return toast.error('Maximum resend attempts reached.');
    if (timer > 0) return;
    try {
      await dispatch(resendOTP({ email: otpEmail, purpose: isForgot ? 'password_reset' : 'email_verification' })).unwrap();
      setTimer(TIMER_SECONDS);
      setResendCount(c => c + 1);
      toast.success('New code sent to your email!');
    } catch (err) {
      toast.error(err || 'Failed to resend OTP');
    }
  };

  const masked = otpEmail ? `${otpEmail[0]}***@${otpEmail.split('@')[1]}` : '';

  return (
    <AuthLayout heading="Verify Your Email 📧" subheading={`We sent a 6-digit code to ${masked}`}>
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center">
            <Mail size={32} className="text-primary" />
          </div>
        </div>

        <OTPInput length={6} onComplete={handleVerify} disabled={isLoading} error={otpError} />

        {/* Timer */}
        <div className="text-center">
          {timer > 0 ? (
            <p className="text-text-secondary text-sm">
              Code expires in{' '}
              <span className="font-mono font-bold text-primary">{formatTime(timer)}</span>
            </p>
          ) : (
            <p className="text-warning text-sm">Code expired. Please resend.</p>
          )}
        </div>

        <motion.button
          onClick={() => otp.length === 6 && handleVerify(otp)}
          disabled={isLoading || otp.length < 6}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {isLoading ? <><Loader2 size={17} className="animate-spin" /> Verifying...</> : 'Verify OTP →'}
        </motion.button>

        <div className="flex flex-col items-center gap-3 text-sm">
          <button
            onClick={handleResend}
            disabled={timer > 0 || resendCount >= MAX_RESENDS || isLoading}
            className={`font-medium transition-colors ${
              timer > 0 || resendCount >= MAX_RESENDS
                ? 'text-text-muted cursor-not-allowed'
                : 'text-primary hover:underline cursor-pointer'
            }`}
          >
            Didn't receive code? Resend OTP {resendCount > 0 ? `(${resendCount}/${MAX_RESENDS})` : ''}
          </button>
          <button
            onClick={() => navigate(isForgot ? '/forgot-password' : '/register')}
            className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} /> Change Email
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTPPage;
