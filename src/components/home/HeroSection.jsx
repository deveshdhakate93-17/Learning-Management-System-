import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Award, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { icon: Users, value: '10,000+', label: 'Active Students' },
  { icon: BookOpen, value: '50+', label: 'Premium Courses' },
  { icon: Award, value: '500+', label: 'Quiz Questions' },
  { icon: Star, value: '4.9', label: 'Average Rating' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

const HeroSection = () => (
  <section className="relative overflow-hidden min-h-[90vh] flex items-center" style={{ background: 'var(--bg-page)' }}>
    {/* Animated blobs */}
    <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 animate-blob-drift" style={{ background: 'radial-gradient(circle, #818CF8, transparent)', filter: 'blur(60px)' }} />
    <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15 animate-blob-drift" style={{ background: 'radial-gradient(circle, #60A5FA, transparent)', filter: 'blur(80px)', animationDelay: '4s' }} />
    <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10 animate-blob-drift" style={{ background: 'radial-gradient(circle, #A78BFA, transparent)', filter: 'blur(50px)', animationDelay: '2s' }} />

    <div className="max-w-7xl mx-auto px-6 pt-28 pb-16 grid lg:grid-cols-2 gap-12 items-center relative z-10">
      {/* Left */}
      <div>
        {/* Badge */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary border border-primary/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-primary text-sm font-semibold">🚀 New: AI-Powered Chat Assistant</span>
        </motion.div>

        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-[56px] leading-[1.1] text-text-primary mb-5">
          Learn & Become the{' '}
          <span className="gradient-text">Top 1% Developer</span>
        </motion.h1>

        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="font-body text-text-secondary text-lg leading-relaxed mb-8 max-w-lg">
          Master DSA, Web Development & AI with industry-level projects and real-world learning. Join 10,000+ students already on the path to success.
        </motion.p>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-wrap gap-4 mb-12">
          <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-3.5">
            Start Learning <ArrowRight size={18} />
          </Link>
          <Link to="/courses" className="btn-outline flex items-center gap-2 text-base px-8 py-3.5">
            <BookOpen size={18} /> Explore Courses
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center p-3 rounded-card bg-white/50 backdrop-blur-sm border border-border/50">
              <Icon size={20} className="text-primary mx-auto mb-1" />
              <p className="font-heading font-bold text-text-primary text-lg">{value}</p>
              <p className="text-text-muted text-xs">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right — Floating hero visual */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="hidden lg:flex justify-center items-center relative">
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative">
          {/* Large circular visual */}
          <div className="w-[380px] h-[380px] rounded-full flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(99,102,241,0.15))', border: '2px solid rgba(79,70,229,0.2)', boxShadow: '0 0 80px rgba(79,70,229,0.2)' }}>
            <div className="text-8xl">👨‍💻</div>
            {/* Orbit rings */}
            <div className="absolute inset-[-20px] rounded-full border border-primary/10 animate-spin-slow" />
            <div className="absolute inset-[-40px] rounded-full border border-primary/5" style={{ animationDuration: '6s' }} />
          </div>

          {/* Floating badges */}
          <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute -top-4 right-0 card px-4 py-2 flex items-center gap-2 !shadow-hover">
            <span className="text-lg">⚡</span>
            <div><p className="text-xs font-bold text-text-primary">Fast Learning</p><p className="text-[10px] text-text-muted">Accelerated Paths</p></div>
          </motion.div>
          <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-4 left-0 card px-4 py-2 flex items-center gap-2 !shadow-hover">
            <span className="text-lg">🎯</span>
            <div><p className="text-xs font-bold text-text-primary">Industry Ready</p><p className="text-[10px] text-text-muted">Real Projects</p></div>
          </motion.div>
          <motion.div animate={{ x: [-5, 5, -5] }} transition={{ duration: 2.8, repeat: Infinity }}
            className="absolute top-1/2 -left-16 card px-4 py-2 flex items-center gap-2 !shadow-hover">
            <span className="text-lg">🏆</span>
            <div><p className="text-xs font-bold text-text-primary">Certified</p><p className="text-[10px] text-text-muted">Verified Certs</p></div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
