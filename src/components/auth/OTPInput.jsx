import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const OTPInput = ({ length = 6, onComplete, disabled = false, error = false }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputs = useRef([]);

  useEffect(() => {
    if (error) {
      // Reset on error after shake
      setTimeout(() => setOtp(new Array(length).fill('')), 600);
      inputs.current[0]?.focus();
    }
  }, [error, length]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      const newOtp = [...otp];
      newOtp[idx] = '';
      setOtp(newOtp);
      return;
    }
    const newOtp = [...otp];
    newOtp[idx] = val[val.length - 1];
    setOtp(newOtp);
    if (idx < length - 1) inputs.current[idx + 1]?.focus();
    if (newOtp.every(d => d !== '')) onComplete(newOtp.join(''));
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[idx]) { newOtp[idx] = ''; setOtp(newOtp); }
      else if (idx > 0) { inputs.current[idx - 1]?.focus(); }
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < length - 1) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
    if (pasted.length === length) onComplete(pasted);
  };

  return (
    <motion.div
      className="flex gap-3 justify-center"
      animate={error ? { x: [0, -8, 8, -8, 8, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {otp.map((digit, idx) => (
        <input
          key={idx}
          ref={el => (inputs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`OTP digit ${idx + 1} of ${length}`}
          className={`w-12 h-14 text-center text-xl font-bold rounded-btn border-2 transition-all duration-200 outline-none focus:scale-105
            ${error
              ? 'border-error bg-red-50 text-error'
              : digit
              ? 'border-primary bg-bg-secondary text-primary shadow-glow-sm'
              : 'border-border bg-white text-text-primary focus:border-primary focus:shadow-glow-sm'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      ))}
    </motion.div>
  );
};

export default OTPInput;
