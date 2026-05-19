import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Priya Sharma', role: 'Frontend Developer at TCS', text: 'LMS completely transformed my career. The structured curriculum and real-world projects helped me land my dream job!', rating: 5 },
  { name: 'Arjun Patel', role: 'Full Stack Developer', text: 'The AI chat assistant is incredible. It helped me debug complex code and understand tough DSA concepts effortlessly.', rating: 5 },
  { name: 'Sneha Gupta', role: 'ML Engineer at Infosys', text: 'Best investment in my learning journey. The AI/ML course content is up-to-date and the quizzes really test your understanding.', rating: 5 },
  { name: 'Rahul Kumar', role: 'SDE at Amazon', text: 'The DSA course with Java was exactly what I needed for placement prep. Cracked Amazon interview in my first attempt!', rating: 5 },
];

const TestimonialsSection = () => (
  <section className="py-20 bg-bg-page">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="section-heading">What Our Students Say ❤️</h2>
        <p className="section-subheading">Join thousands of successful developers who started their journey with LMS</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map(({ name, role, text, rating }, i) => (
          <motion.div key={name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="card p-6 hover:shadow-hover">
            <div className="flex gap-1 mb-3">
              {Array.from({ length: rating }).map((_, j) => (
                <Star key={j} size={14} className="fill-warning text-warning" />
              ))}
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-4 italic">"{text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                {name[0]}
              </div>
              <div>
                <p className="font-heading font-semibold text-text-primary text-sm">{name}</p>
                <p className="text-text-muted text-xs">{role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
