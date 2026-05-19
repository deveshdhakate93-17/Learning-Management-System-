import { Router } from 'express';
import { register, verifyOTP, resendOTP, login, refresh, logout, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/forgot-password/verify', authLimiter, verifyOTP);
router.post('/reset-password', authLimiter, resetPassword);

// OAuth — Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/oauth/callback?token=${token}`); // ✅ FIXED
  }
);

// OAuth — GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/oauth/callback?token=${token}`); // ✅ FIXED
  }
);

export default router;