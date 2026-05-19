import { motion } from 'framer-motion';
import { Globe, Brain, Palette, Database } from 'lucide-react';

const domains = [
  { icon: Globe, title: 'Web Development', description: 'Learn Frontend, Backend, React, Node.js, MongoDB and build real-world projects.' },
  { icon: Brain, title: 'AI / Machine Learning', description: 'Master AI tools, Machine Learning models, Deep Learning and automation.' },
  { icon: Palette, title: 'UI/UX Design', description: 'Design beautiful user interfaces and modern user experiences using Figma.' },
  { icon: Database, title: 'DSA — Data Structures', description: 'Crack coding interviews with advanced DSA concepts and problem solving.' },
];

const DomainSection = () => (
  <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2A4FB3 40%, #4F46E5 70%, #6366F1 100%)' }}>
    {/* Wave top */}
    <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" style={{ height: '60px', transform: 'translateY(-99%)' }}>
      <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="#1E3A8A" />
    </svg>

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="font-heading font-extrabold text-white text-3xl sm:text-4xl mb-3">
          Explore Premium Learning Domains 🚀
        </h2>
        <p className="text-blue-200 text-base max-w-2xl mx-auto">
          Master industry-ready skills with modern learning paths and real-world projects.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {domains.map(({ icon: Icon, title, description }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group p-6 rounded-2xl cursor-pointer transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:shadow-glow"
              style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Icon size={26} className="text-white" />
            </div>
            <h3 className="font-heading font-bold text-white text-lg mb-2">{title}</h3>
            <p className="text-blue-100 text-sm leading-relaxed opacity-85">{description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default DomainSection;
