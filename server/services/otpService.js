import crypto from 'crypto';
import OTP from '../models/OTP.js';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generate a random 6-digit OTP string.
 */
export const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

/**
 * Create and save OTP to database with bcrypt hash (model handles hashing).
 */
export const createOTP = async (email, purpose = 'email_verification') => {
  const otp = generateOTP();
  await OTP.create({
    email,
    otp,
    purpose,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
  });
  return otp;
};

/**
 * Verify OTP against database.
 * Returns { valid: boolean, message: string }
 */
export const verifyOTPToken = async (email, otp, purpose = 'email_verification') => {
  const record = await OTP.findOne({
    email,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    return { valid: false, message: 'OTP expired or not found' };
  }

  if (record.attempts >= 3) {
    return { valid: false, message: 'Too many attempts. Request a new code.' };
  }

  const isValid = await record.verifyOTP(otp);
  if (!isValid) {
    record.attempts++;
    await record.save();
    return { valid: false, message: 'Invalid OTP' };
  }

  record.isUsed = true;
  await record.save();
  return { valid: true, message: 'OTP verified successfully' };
};

/**
 * Invalidate all existing OTPs for an email+purpose.
 */
export const invalidateOTPs = async (email, purpose) => {
  await OTP.updateMany(
    { email, purpose, isUsed: false },
    { isUsed: true }
  );
};
