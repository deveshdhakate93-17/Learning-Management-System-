import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/auth/AuthLayout';
import { forgotPassword, setOtpEmail } from '../../store/authSlice';

const schema = yup.object({ email: yup.string().email('Enter a valid email').required('Email is required') });

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await dispatch(forgotPassword(data)).unwrap();
      dispatch(setOtpEmail(data.email));
      toast.success('Reset code sent! Check your email.');
      navigate('/forgot-password/verify');
    } catch {
      toast.success('If that email exists, a reset code has been sent.');
      navigate('/forgot-password/verify');
    }
  };

  return (
    <AuthLayout heading="Reset Password 🔐" subheading="Enter your email to receive a verification code">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center">
            <Mail size={32} className="text-primary" />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">Email Address *</label>
          <input id="email" type="email" placeholder="your@email.com" {...register('email')}
            className={`input-field ${errors.email ? 'border-error' : ''}`} />
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>
        <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {isLoading ? <><Loader2 size={17} className="animate-spin" /> Sending...</> : 'Send Reset Code →'}
        </motion.button>
        <p className="text-center text-text-secondary text-sm">
          Remembered it? <a href="/login" className="text-primary font-semibold hover:underline">Back to Login</a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
