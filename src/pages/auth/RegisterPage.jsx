import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import { registerUser, setOtpEmail } from '../../store/authSlice';

const schema = yup.object({
  fullName: yup.string().min(2, 'Name must be at least 2 characters').required('Full name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
  role: yup.string().oneOf(['student', 'instructor']).required('Please select a role'),
  terms: yup.boolean().oneOf([true], 'You must accept the terms'),
});

const RegisterPage = () => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((s) => s.auth);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'student' },
  });

  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(registerUser({ fullName: data.fullName, email: data.email, password: data.password, role: data.role })).unwrap();
      dispatch(setOtpEmail(data.email));
      toast.success('Verification code sent to your email!');
      navigate('/verify-otp');
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  const field = (id, label, type, placeholder, reg, error, extra) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      <div className="relative">
        <input id={id} type={type} placeholder={placeholder} {...register(reg)}
          className={`input-field ${error ? 'border-error focus:ring-error' : ''} ${extra ? 'pr-10' : ''}`}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {extra}
      </div>
      {error && <p id={`${id}-error`} className="text-error text-xs mt-1">{error.message}</p>}
    </div>
  );

  return (
    <AuthLayout heading="Create Your Account 🚀" subheading="Join thousands of learners leveling up their careers">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {field('fullName', 'Full Name *', 'text', 'John Doe', 'fullName', errors.fullName)}
        {field('email', 'Email Address *', 'email', 'your@email.com', 'email', errors.email)}

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1.5">Password *</label>
          <div className="relative">
            <input id="password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
              {...register('password')}
              className={`input-field pr-10 ${errors.password ? 'border-error' : ''}`}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <PasswordStrengthMeter password={password} />
          {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password *</label>
          <div className="relative">
            <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password"
              {...register('confirmPassword')}
              className={`input-field pr-10 ${errors.confirmPassword ? 'border-error' : ''}`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">I am a *</label>
          <div className="grid grid-cols-2 gap-3">
            {['student', 'instructor'].map((r) => (
              <label key={r} className="relative cursor-pointer">
                <input type="radio" value={r} {...register('role')} className="sr-only" />
                <div className={`flex items-center justify-center gap-2 p-3 rounded-btn border-2 text-sm font-medium transition-all ${
                  watch('role') === r ? 'border-primary bg-bg-secondary text-primary' : 'border-border text-text-secondary hover:border-primary'
                }`}>
                  {r === 'student' ? '🎓' : '👨‍🏫'} {r.charAt(0).toUpperCase() + r.slice(1)}
                </div>
              </label>
            ))}
          </div>
          {errors.role && <p className="text-error text-xs mt-1">{errors.role.message}</p>}
        </div>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" {...register('terms')} className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary" />
            <span className="text-sm text-text-secondary">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <p className="text-error text-xs mt-1">{errors.terms.message}</p>}
        </div>

        <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {isLoading ? <><Loader2 size={17} className="animate-spin" /> Creating account...</> : 'Create Account & Verify →'}
        </motion.button>

        <div className="divider">or continue with</div>
        <div className="grid grid-cols-2 gap-3">
          <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-btn text-sm font-medium hover:bg-bg-secondary transition-all">
            <svg width="17" height="17" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </a>
          <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/github`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-btn text-sm font-medium hover:bg-bg-secondary transition-all">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> GitHub
          </a>
        </div>
        <p className="text-center text-text-secondary text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
