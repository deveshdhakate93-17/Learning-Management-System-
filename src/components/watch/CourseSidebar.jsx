import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp, ChevronDown, CheckCircle2, PlayCircle, Clock
} from 'lucide-react';

/**
 * CourseSidebar — Collapsible accordion sidebar for course navigation.
 *
 * Props:
 *  - courseTitle       : string (e.g. "Web Development", "Python Programming")
 *  - courseData        : array of section objects (id, section, topics[])
 *  - currentTopicId    : id of the currently playing topic
 *  - completedTopics   : Set<string> of completed topic IDs
 *  - openSections      : object { [sectionId]: boolean }
 *  - onToggleSection   : (sectionId) => void
 *  - onSelectTopic     : (topic) => void
 *  - totalTopics       : number
 */
const CourseSidebar = ({
  courseTitle,
  courseData,
  currentTopicId,
  completedTopics,
  openSections,
  onToggleSection,
  onSelectTopic,
  totalTopics,
}) => {
  const completedCount = completedTopics.size;
  const progressPct = totalTopics > 0
    ? Math.round((completedCount / totalTopics) * 100)
    : 0;

  /** Format seconds → "Xm Ys" */
  const formatDuration = (start, end) => {
    const dur = end - start;
    const m = Math.floor(dur / 60);
    const s = dur % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  /** Map videoId → subject badge label + colour */
  const subjectBadge = (videoId) => {
    if (videoId === 'HcOc7P5BMi4') return { label: 'HTML', color: '#E34C26' };
    if (videoId === 'ESnrn1kAD4E') return { label: 'CSS',  color: '#264DE4' };
    if (videoId === 'VlPiVmYuoqw') return { label: 'JS',   color: '#F7DF1E' };
    if (videoId === 'UrsmFxEIp5k') return { label: 'Python', color: '#3776AB' };
    return null;
  };

  return (
    <div className="h-full flex flex-col bg-sidebar-bg text-gray-200 dark-scroll overflow-y-auto">
      {/* ── Header ─────────────────────────────────── */}
      <div className="p-4 border-b border-sidebar-border">
        <h3 className="font-heading font-bold text-white text-sm mb-1">
          {courseTitle || 'Course'}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>{completedCount} / {totalTopics} topics completed</span>
          <span className="text-sidebar-accent font-semibold">{progressPct}%</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── Sections ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto dark-scroll">
        {courseData.map((section) => {
          const sectionComplete = section.topics.every(t =>
            completedTopics.has(t.id)
          );
          const sectionCompletedCount = section.topics.filter(t =>
            completedTopics.has(t.id)
          ).length;
          const badge = subjectBadge(section.videoId);

          return (
            <div key={section.id}>
              {/* Section Header */}
              <button
                onClick={() => onToggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-sidebar-hover text-left transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500 font-medium block">
                    Section · {sectionCompletedCount}/{section.topics.length}
                  </span>
                  <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    {section.section}
                    {badge && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: `${badge.color}22`,
                          color: badge.color,
                          border: `1px solid ${badge.color}44`,
                        }}
                      >
                        {badge.label}
                      </span>
                    )}
                    {sectionComplete && (
                      <CheckCircle2 size={13} className="text-green-400 flex-shrink-0" />
                    )}
                  </span>
                </div>
                {openSections[section.id]
                  ? <ChevronUp size={14} className="text-gray-500 flex-shrink-0" />
                  : <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
                }
              </button>

              {/* Topics */}
              <AnimatePresence>
                {openSections[section.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    {section.topics.map((topic) => {
                      const isActive = currentTopicId === topic.id;
                      const isDone = completedTopics.has(topic.id);

                      return (
                        <button
                          key={topic.id}
                          onClick={() => onSelectTopic(topic)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all ${
                            isActive
                              ? 'bg-sidebar-active border-l-2 border-sidebar-accent text-white'
                              : 'hover:bg-sidebar-hover text-gray-400 border-l-2 border-transparent'
                          }`}
                        >
                          {/* Status icon */}
                          {isDone ? (
                            <CheckCircle2
                              size={15}
                              className="text-green-400 flex-shrink-0"
                            />
                          ) : (
                            <PlayCircle
                              size={15}
                              className={`flex-shrink-0 ${
                                isActive ? 'text-sidebar-accent' : 'text-gray-600'
                              }`}
                            />
                          )}
                          {/* Title */}
                          <span className="flex-1 truncate">{topic.title}</span>
                          {/* Duration */}
                          <span className="text-xs text-gray-600 flex-shrink-0 flex items-center gap-1">
                            <Clock size={10} />
                            {formatDuration(topic.start, topic.end)}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(CourseSidebar);
