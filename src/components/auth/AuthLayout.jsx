import { motion } from 'framer-motion';
import { BookOpen, Award, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import LMSLogo from '../shared/LMSLogo';

const features = [
  { icon: BookOpen, text: '500+ Quiz Questions' },
  { icon: Award, text: 'Verified Certificates' },
  { icon: Users, text: '10,000+ Students' },
  { icon: Sparkles, text: 'AI-Powered Chat' },
];

const AuthLayout = ({ children, heading, subheading }) => (
  <div className="min-h-screen flex">
    {/* Left panel — 45% */}
    <motion.div
      className="hidden md:flex flex-col justify-between w-5/12 relative overflow-hidden p-10"
      style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2A4FB3 40%, #4F46E5 70%, #6366F1 100%)' }}
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Blobs */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-20 animate-blob-drift"
        style={{ background: 'radial-gradient(circle, #818CF8, transparent)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-15 animate-blob-drift"
        style={{ background: 'radial-gradient(circle, #60A5FA, transparent)', filter: 'blur(40px)', animationDelay: '3s' }} />

      {/* Brand */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <LMSLogo size={48} />
          <div>
            <p className="font-heading font-extrabold text-white text-lg leading-tight">LMS</p>
            <p className="text-blue-200 text-xs">Learning Management System</p>
          </div>
        </div>
        <h2 className="font-heading font-extrabold text-white text-3xl leading-tight mb-3">
          Learn Without<br /><span className="text-blue-200">Limits 🚀</span>
        </h2>
        <p className="text-blue-100 text-sm leading-relaxed opacity-90">
          Master industry-ready skills with structured learning paths, real-world projects, and AI-powered support.
        </p>
      </div>

      {/* Features */}
      <div className="relative z-10 space-y-3">
        {features.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Icon size={16} className="text-white" />
            </div>
            <span className="text-blue-100 text-sm font-medium">{text}</span>
            <CheckCircle2 size={14} className="text-green-300 ml-auto" />
          </div>
        ))}
      </div>

      {/* Quote */}
      <div className="relative z-10 p-4 rounded-card" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
        <p className="text-white text-sm italic">"The best investment you can make is in yourself."</p>
        <p className="text-blue-200 text-xs mt-1">— Warren Buffett</p>
      </div>
    </motion.div>

    {/* Right panel — 55% */}
    <motion.div
      className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-bg-page"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-3 mb-6">
          <LMSLogo size={36} />
          <p className="font-heading font-bold text-primary">LMS Learning Management System</p>
        </div>
        <div className="card p-8 sm:p-10">
          {heading && (
            <div className="mb-7">
              <h1 className="font-heading font-extrabold text-text-primary text-2xl mb-1">{heading}</h1>
              {subheading && <p className="text-text-secondary text-sm">{subheading}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </motion.div>
  </div>
);

export default AuthLayout;
