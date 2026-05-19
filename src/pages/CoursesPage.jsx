import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import progressService from '../services/progressService';

// ── Course definitions (static — matches courseRegistry slugs) ──
const courseDefs = [
  {
    id: 'web-development',
    slug: 'web-development',
    title: 'Web Development',
    subtitle: 'Complete Full Stack Web Development Course',
    accessUntil: 'Access until 2027',
    icon: '💻',
    totalTopics: 60,  // from courseData TOTAL_TOPICS
    gradient: 'linear-gradient(135deg, #FF6B35, #F7931E)',
  },
  {
    id: 'python-programming',
    slug: 'python-programming',
    title: 'Python Programming',
    subtitle: 'Beginner to Advanced Python with Projects & AI Apps',
    accessUntil: 'Access until 2027',
    icon: '🐍',
    totalTopics: 32,  // from pythonCourseData PYTHON_TOTAL_TOPICS
    gradient: 'linear-gradient(135deg, #3776AB, #FFD43B)',
  },
  {
    id: 'ai-ml',
    slug: 'ai-ml',
    title: 'AI/ML Masterclass',
    subtitle: 'Complete AI & Machine Learning Program',
    accessUntil: 'Access until 2027',
    icon: '🤖',
    totalTopics: 60,
    gradient: 'linear-gradient(135deg, #667EEA, #764BA2)',
  },
];

// ── localStorage keys per course ──
const LS_KEYS = {
  'web-development': 'webdev_progress',
  'python-programming': 'python_progress',
};

/** Load completed count from localStorage for instant display */
const getLocalProgress = (courseId) => {
  try {
    const key = LS_KEYS[courseId];
    if (!key) return 0;
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length;
    return parsed.completedTopics?.length || 0;
  } catch {
    return 0;
  }
};

const CoursesPage = () => {
  const { user } = useSelector((s) => s.auth);
  const [progressMap, setProgressMap] = useState({});

  // Load progress on mount — localStorage first (instant), then API merge
  useEffect(() => {
    // 1) Instant: load from localStorage
    const localMap = {};
    courseDefs.forEach((c) => {
      localMap[c.id] = getLocalProgress(c.id);
    });
    setProgressMap(localMap);

    // 2) Async: merge from API
    const loadFromApi = async () => {
      const updated = { ...localMap };
      for (const c of courseDefs) {
        if (!LS_KEYS[c.id]) continue; // skip courses without watch pages
        try {
          const data = await progressService.getCourseProgress(c.id);
          const serverCount = data?.completedTopics?.length || 0;
          // Use whichever is higher (local vs server)
          updated[c.id] = Math.max(updated[c.id] || 0, serverCount);
        } catch {
          // API unavailable — keep localStorage value
        }
      }
      setProgressMap(updated);
    };
    loadFromApi();
  }, []);

  return (
    <div className="min-h-screen pt-[75px]">
      {/* Header */}
      <div className="py-12" style={{ background: 'linear-gradient(135deg, #EDF3FF, #DBEAFE)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GraduationCap size={40} className="text-primary-deep mx-auto mb-3" />
            <h1 className="font-heading font-extrabold text-primary-deep text-3xl mb-2">
              Hi {user?.fullName?.split(' ')[0] || 'Student'}, Welcome to Your Courses! 🎓
            </h1>
            <p className="text-text-secondary font-body text-base">Continue where you left off</p>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {courseDefs.map((course, i) => {
            const completedCount = progressMap[course.id] || 0;
            const progress = course.totalTopics > 0
              ? Math.round((completedCount / course.totalTopics) * 100)
              : 0;
            const hasWatchPage = !!LS_KEYS[course.id]; // only courses with watch pages

            return (
              <motion.div key={course.id}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card overflow-hidden group">
                {/* Thumbnail */}
                <div className="relative h-44 flex items-center justify-center text-6xl" style={{ background: course.gradient }}>
                  <span>{course.icon}</span>
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-text-primary px-3 py-1 rounded-full">
                    {course.accessUntil}
                  </span>
                </div>
                {/* Content */}
                <div className="p-6">
                  <h3 className="font-heading font-bold text-text-primary text-lg mb-1">{course.title}</h3>
                  <p className="text-text-secondary text-sm mb-4">{course.subtitle}</p>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-primary">{progress}% Complete</span>
                      <span className="text-xs text-text-muted">{completedCount}/{course.totalTopics} topics</span>
                    </div>
                    <div className="progress-track">
                      <motion.div className="progress-bar" initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }} />
                    </div>
                  </div>
                  {hasWatchPage ? (
                    <Link to={`/watch/${course.slug}`}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm group-hover:shadow-glow">
                      Continue Learning <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg
                        bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
