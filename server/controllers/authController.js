import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import transporter from '../config/mailer.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const sendOTPEmail = async (email, otp, purpose) => {
  const subject = purpose === 'email_verification' ? '🔐 LMS — Email Verification' : '🔐 LMS — Password Reset';
  const html = `<div style="font-family:DM Sans,sans-serif;max-width:480px;margin:auto;padding:30px;background:#fff;border-radius:12px;border:1px solid #e5e7eb"><h2 style="color:#1E3A8A;margin-bottom:6px">LMS Learning Management System</h2><p style="color:#64748b;margin-bottom:20px">${purpose === 'email_verification' ? 'Verify your email address' : 'Reset your password'}</p><div style="background:linear-gradient(135deg,#2A4FB3,#4F46E5);color:#fff;font-size:32px;letter-spacing:8px;text-align:center;padding:20px;border-radius:10px;font-weight:700">${otp}</div><p style="color:#64748b;font-size:14px;margin-top:16px">This code expires in <strong>10 minutes</strong>. Don't share it.</p></div>`;
  await transporter.sendMail({ from: `"LMS" <${process.env.SMTP_USER}>`, to: email, subject, html });
};

export const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ fullName, email, password, role });
    const otp = generateOTP();
    await OTP.create({ email, otp, purpose: 'email_verification', expiresAt: new Date(Date.now() + 600000) });

    try { await sendOTPEmail(email, otp, 'email_verification'); } catch (e) { console.warn('Mail send failed:', e.message); }
    res.status(201).json({ message: 'Account created. Verify your email.', email });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = 'email_verification' } = req.body;
    const record = await OTP.findOne({ email, purpose, isUsed: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ message: 'OTP expired or not found' });
    if (record.attempts >= 3) return res.status(429).json({ message: 'Too many attempts' });

    const valid = await record.verifyOTP(otp);
    if (!valid) { record.attempts++; await record.save(); return res.status(400).json({ message: 'Invalid OTP' }); }

    record.isUsed = true;
    await record.save();

    if (purpose === 'email_verification') {
      const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
      const { accessToken, refreshToken } = generateTokens(user._id);
      user.refreshToken = refreshToken; await user.save();
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', maxAge: 7 * 24 * 3600000 });
      return res.json({ token: accessToken, user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar } });
    }
    res.json({ message: 'OTP verified', email });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const resendOTP = async (req, res) => {
  try {
    const { email, purpose = 'email_verification' } = req.body;
    const otp = generateOTP();
    await OTP.create({ email, otp, purpose, expiresAt: new Date(Date.now() + 600000) });
    try { await sendOTPEmail(email, otp, purpose); } catch {}
    res.json({ message: 'OTP sent' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isLocked()) return res.status(423).json({ message: 'Account locked. Try again later.' });
    if (user.authProvider !== 'local') return res.status(400).json({ message: `Please sign in with ${user.authProvider}` });
    if (!user.isVerified) return res.status(403).json({ message: 'Email not verified' });

    const valid = await user.comparePassword(password);
    if (!valid) {
      user.failedLoginAttempts++;
      if (user.failedLoginAttempts >= 5) user.lockUntil = new Date(Date.now() + 30 * 60000);
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.failedLoginAttempts = 0; user.lockUntil = null; user.lastLogin = new Date();
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', maxAge: 7 * 24 * 3600000 });
    res.json({ token: accessToken, user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) return res.status(401).json({ message: 'Invalid refresh token' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken; await user.save();
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', maxAge: 7 * 24 * 3600000 });
    res.json({ token: accessToken });
  } catch { res.status(401).json({ message: 'Token refresh failed' }); }
};

export const logout = async (req, res) => {
  try {
    if (req.user) { req.user.refreshToken = null; await req.user.save(); }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getMe = async (req, res) => {
  res.json({ _id: req.user._id, fullName: req.user.fullName, email: req.user.email, role: req.user.role, avatar: req.user.avatar });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();
    await OTP.create({ email, otp, purpose: 'password_reset', expiresAt: new Date(Date.now() + 600000) });
    try { await sendOTPEmail(email, otp, 'password_reset'); } catch {}
    res.json({ message: 'Reset code sent', email });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = password; user.failedLoginAttempts = 0; user.lockUntil = null;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
