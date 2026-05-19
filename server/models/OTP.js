import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  purpose: { type: String, enum: ['email_verification', 'password_reset', 'email_change'], required: true },
  attempts: { type: Number, default: 0, max: 3 },
  resendCount: { type: Number, default: 0, max: 3 },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});

otpSchema.pre('save', async function (next) {
  if (!this.isModified('otp')) return next();
  this.otp = await bcrypt.hash(this.otp, 10);
  next();
});

otpSchema.methods.verifyOTP = async function (candidateOTP) {
  return bcrypt.compare(candidateOTP, this.otp);
};

export default mongoose.model('OTP', otpSchema);
