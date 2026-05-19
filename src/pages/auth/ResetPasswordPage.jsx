import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import { resetPassword } from '../../store/authSlice';

const schema = yup.object({
  password: yup.string().min(8, 'Min 8 characters').required('Required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Required'),
});

const ResetPasswordPage = () => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, otpEmail } = useSelector((s) => s.auth);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await dispatch(resetPassword({ email: otpEmail, password: data.password })).unwrap();
      toast.success('Password updated! Please log in.');
      navigate('/login');
    } catch (err) { toast.error(err || 'Reset failed'); }
  };

  return (
    <AuthLayout heading="Set New Password 🔒" subheading="Create a strong password for your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center">
            <Lock size={32} className="text-primary" />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1.5">New Password *</label>
          <div className="relative">
            <input id="password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
              {...register('password')} className={`input-field pr-10 ${errors.password ? 'border-error' : ''}`} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <PasswordStrengthMeter password={watch('password', '')} />
          {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password *</label>
          <div className="relative">
            <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password"
              {...register('confirmPassword')} className={`input-field pr-10 ${errors.confirmPassword ? 'border-error' : ''}`} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {isLoading ? <><Loader2 size={17} className="animate-spin" /> Resetting...</> : 'Reset Password →'}
        </motion.button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
