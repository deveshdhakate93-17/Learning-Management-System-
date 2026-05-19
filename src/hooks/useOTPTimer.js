import { useState, useEffect, useCallback, useRef } from 'react';

const OTP_DURATION = 180; // 3 minutes in seconds
const MAX_RESENDS = 3;

const useOTPTimer = ({ onResend } = {}) => {
  const [timeLeft, setTimeLeft] = useState(OTP_DURATION);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const intervalRef = useRef(null);

  // Start countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((p) => p - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [timeLeft]);

  const resetTimer = useCallback(() => {
    setTimeLeft(OTP_DURATION);
    setCanResend(false);
  }, []);

  const handleResend = useCallback(async () => {
    if (resendCount >= MAX_RESENDS || !canResend || isResending) return;
    setIsResending(true);
    try {
      await onResend?.();
      setResendCount((p) => p + 1);
      resetTimer();
    } catch {
      // error handled upstream
    } finally {
      setIsResending(false);
    }
  }, [resendCount, canResend, isResending, onResend, resetTimer]);

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const formattedTime = formatTime(timeLeft);
  const resendsRemaining = MAX_RESENDS - resendCount;
  const isExpired = timeLeft <= 0;

  return {
    timeLeft,
    formattedTime,
    canResend,
    isResending,
    isExpired,
    resendCount,
    resendsRemaining,
    handleResend,
    resetTimer,
  };
};

export default useOTPTimer;
