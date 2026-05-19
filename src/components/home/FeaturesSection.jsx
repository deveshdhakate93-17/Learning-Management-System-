import { motion } from 'framer-motion';
import { HelpCircle, Layers, Award, Sparkles, FileText, BarChart3 } from 'lucide-react';

const features = [
  { icon: HelpCircle, title: '500+ Quiz Questions', description: 'Test your knowledge with curated quizzes across 19 topics and 4 learning tracks.' },
  { icon: Layers, title: '4 Learning Tracks', description: 'Web Development, AI/ML, Python, and DSA — structured paths to mastery.' },
  { icon: Award, title: 'Verified Certificates', description: 'Earn industry-recognized certificates upon course completion.' },
  { icon: Sparkles, title: 'AI-Powered Chat', description: 'Get instant help from our AI coding assistant for any question.' },
  { icon: FileText, title: 'Lecture-wise Notes', description: 'Upload, organize, and search your notes with AI-powered insights.' },
  { icon: BarChart3, title: 'Progress Tracking', description: 'Visual dashboards to track your learning journey and milestones.' },
];

const FeaturesSection = () => (
  <section className="py-20 bg-bg-secondary">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="section-heading">Why Choose LMS? 🎯</h2>
        <p className="section-subheading">Everything you need to become a world-class developer</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {features.map(({ icon: Icon, title, description }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="card p-7 hover:shadow-hover group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
              <Icon size={22} className="text-white" />
            </div>
            <h3 className="font-heading font-bold text-text-primary text-base mb-2">{title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
