import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';

const courses = [
  { id: 'web-development', title: 'Full Stack Web Development', description: 'HTML → CSS → JS → React → Node → MongoDB', duration: '6 months', icon: '💻', gradient: 'linear-gradient(135deg, #FF6B35, #F7931E)' },
  { id: 'dsa-java', title: 'DSA with Java', description: 'Arrays, Trees, Graphs, DP, Interview Prep', duration: '4 months', icon: '🧮', gradient: 'linear-gradient(135deg, #667EEA, #764BA2)' },
  { id: 'ai-ml', title: 'AI & Machine Learning', description: 'Python, ML Algorithms, Deep Learning, Projects', duration: '5 months', icon: '🤖', gradient: 'linear-gradient(135deg, #11998E, #38EF7D)' },
];

const CoursesPreview = () => (
  <section className="py-20 bg-bg-page">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="section-heading">Popular Courses ✨</h2>
        <p className="section-subheading">Industry-focused courses designed to make you job-ready</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {courses.map(({ id, title, description, duration, icon, gradient }, i) => (
          <motion.div key={id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card overflow-hidden group">
            <div className="h-44 flex items-center justify-center text-6xl" style={{ background: gradient }}>
              {icon}
            </div>
            <div className="p-6">
              <h3 className="font-heading font-bold text-text-primary text-lg mb-2">{title}</h3>
              <p className="text-text-secondary text-sm mb-4">{description}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-text-muted text-xs"><Clock size={13} /> {duration}</span>
                <Link to="/register" className="flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all">
                  Enroll <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CoursesPreview;
