import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  PanelLeftClose, PanelLeft, Menu, X,
  Clock, SkipForward,
} from 'lucide-react';
import CourseSidebar from '../components/watch/CourseSidebar';
import VideoPlayer from '../components/watch/VideoPlayer';
import progressService from '../services/progressService';
import { getCourseBySlug } from '../data/courseRegistry';

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════

/** Save to localStorage (keyed per course) */
const saveProgressLocal = (lsKey, completedIds, lastTopicId) => {
  try {
    localStorage.setItem(
      lsKey,
      JSON.stringify({
        completedTopics: [...completedIds],
        lastWatchedTopicId: lastTopicId,
      })
    );
  } catch { /* quota exceeded – ignore */ }
};

/** Load from localStorage (keyed per course) */
const loadProgressLocal = (lsKey) => {
  try {
    const raw = localStorage.getItem(lsKey);
    if (!raw) return { completed: new Set(), lastTopic: null };
    const parsed = JSON.parse(raw);
    // Support both old format (array) and new format (object)
    if (Array.isArray(parsed)) {
      return { completed: new Set(parsed), lastTopic: null };
    }
    return {
      completed: new Set(parsed.completedTopics || []),
      lastTopic: parsed.lastWatchedTopicId || null,
    };
  } catch {
    return { completed: new Set(), lastTopic: null };
  }
};

/** Format seconds → "Xm Ys" */
const formatDuration = (start, end) => {
  const d = end - start;
  const m = Math.floor(d / 60);
  const s = d % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// ══════════════════════════════════════════════════════════
// WATCHPAGE COMPONENT — course-agnostic via courseRegistry
// ══════════════════════════════════════════════════════════
const WatchPage = () => {
  const { courseSlug } = useParams();

  // ── Resolve course data from registry ───────────────────
  const courseConfig = useMemo(() => getCourseBySlug(courseSlug), [courseSlug]);

  // If slug is invalid, redirect to courses page
  if (!courseConfig) {
    return <Navigate to="/courses" replace />;
  }

  // Destructure course config
  const {
    courseId,
    title: courseTitle,
    courseData,
    allTopics,
    totalTopics,
    lsKey,
  } = courseConfig;

  return (
    <WatchPageInner
      key={courseId} // Forces full remount when switching courses
      courseId={courseId}
      courseTitle={courseTitle}
      courseData={courseData}
      allTopics={allTopics}
      totalTopics={totalTopics}
      lsKey={lsKey}
    />
  );
};

// ══════════════════════════════════════════════════════════
// INNER COMPONENT — all the logic, isolated per course
// ══════════════════════════════════════════════════════════
const WatchPageInner = ({
  courseId,
  courseTitle,
  courseData,
  allTopics,
  totalTopics,
  lsKey,
}) => {
  // ── Refs ──────────────────────────────────────────────
  const countdownRef = useRef(null);

  // ── State ─────────────────────────────────────────────
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [currentTopic, setCurrentTopic] = useState(allTopics[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [openSections, setOpenSections] = useState(
    courseData.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  // Auto-play next banner state
  const [nextCountdown, setNextCountdown] = useState(null);
  const [nextTopicName, setNextTopicName] = useState('');

  const currentIdx = useMemo(
    () => allTopics.findIndex((t) => t.id === currentTopic.id),
    [currentTopic.id, allTopics]
  );

  // ══════════════════════════════════════════════════════
  // MARK TOPIC COMPLETE
  // ══════════════════════════════════════════════════════

  const markCompleteInternal = useCallback((topicId) => {
    setCompletedTopics((prev) => {
      if (prev.has(topicId)) return prev;
      const next = new Set(prev);
      next.add(topicId);
      saveProgressLocal(lsKey, next, topicId);
      return next;
    });
    try {
      progressService.markLectureCompleted(courseId, topicId, totalTopics);
    } catch { /* offline */ }
  }, [courseId, lsKey, totalTopics]);

  // ── VideoPlayer callbacks ──────────────────────────────

  /** Called by VideoPlayer when a topic's end time is hit */
  const handleTopicComplete = useCallback((topicId) => {
    markCompleteInternal(topicId);
    // Show auto-next banner
    const topicIdx = allTopics.findIndex((t) => t.id === topicId);
    if (topicIdx < allTopics.length - 1) {
      const nextTopic = allTopics[topicIdx + 1];
      setNextTopicName(nextTopic.title);
      setNextCountdown(3);
      let remaining = 3;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setNextCountdown(null);
          setNextTopicName('');
        } else {
          setNextCountdown(remaining);
        }
      }, 1000);
    }
  }, [markCompleteInternal, allTopics]);

  /** Called by VideoPlayer 3 s after topic ends → advance to next topic */
  const handleNextTopic = useCallback(() => {
    setCurrentTopic((prev) => {
      const idx = allTopics.findIndex((t) => t.id === prev.id);
      return idx < allTopics.length - 1 ? allTopics[idx + 1] : prev;
    });
    setNextCountdown(null);
    setNextTopicName('');
  }, [allTopics]);

  // ══════════════════════════════════════════════════════
  // TOPIC CLICK HANDLER
  // ══════════════════════════════════════════════════════

  const handleTopicClickInternal = useCallback((topic) => {
    // Cancel any pending auto-play countdown
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setNextCountdown(null);
    setNextTopicName('');

    // Find the enriched topic from allTopics (which includes videoId from parent section).
    // Sidebar topics come from raw courseData and may lack videoId.
    const enrichedTopic = allTopics.find((t) => t.id === topic.id) || topic;

    // Set new topic — VideoPlayer reacts to this via useEffect([currentTopic])
    setCurrentTopic(enrichedTopic);

    // Save last watched
    setCompletedTopics((prev) => {
      saveProgressLocal(lsKey, prev, enrichedTopic.id);
      return prev;
    });
    try {
      progressService.saveResumePosition(courseId, enrichedTopic.id, enrichedTopic.start);
    } catch { /* ignore */ }
  }, [allTopics, courseId, lsKey]);

  /** Public topic click: also opens parent section + closes mobile drawer */
  const goToTopic = useCallback((topic) => {
    handleTopicClickInternal(topic);

    // Open the section containing this topic
    const parentSection = courseData.find((s) =>
      s.topics.some((t) => t.id === topic.id)
    );
    if (parentSection) {
      setOpenSections((prev) => ({ ...prev, [parentSection.id]: true }));
    }

    // Close mobile drawer
    setMobileDrawer(false);
  }, [handleTopicClickInternal, courseData]);

  const goNext = useCallback(() => {
    if (currentIdx < allTopics.length - 1) {
      goToTopic(allTopics[currentIdx + 1]);
    }
  }, [currentIdx, goToTopic, allTopics]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      goToTopic(allTopics[currentIdx - 1]);
    }
  }, [currentIdx, goToTopic, allTopics]);

  // ══════════════════════════════════════════════════════
  // LOAD PROGRESS ON MOUNT
  // ══════════════════════════════════════════════════════

  useEffect(() => {
    const load = async () => {
      // 1) Load from localStorage (instant)
      const local = loadProgressLocal(lsKey);
      let completed = local.completed;
      let lastTopicId = local.lastTopic;

      // 2) Try API (merge)
      try {
        const serverData = await progressService.getCourseProgress(courseId);
        if (serverData?.completedTopics?.length) {
          serverData.completedTopics.forEach((id) => completed.add(id));
        }
        if (serverData?.completedLectures?.length) {
          serverData.completedLectures.forEach((l) =>
            completed.add(typeof l === 'string' ? l : l.lecture)
          );
        }
        if (serverData?.lastWatchedTopicId) {
          lastTopicId = serverData.lastWatchedTopicId;
        }
        if (serverData?.lastWatched?.lecture) {
          lastTopicId = lastTopicId || serverData.lastWatched.lecture;
        }
      } catch {
        // API unavailable — localStorage is fine
      }

      setCompletedTopics(completed);

      // Resume from last watched topic
      if (lastTopicId) {
        const found = allTopics.find((t) => t.id === lastTopicId);
        if (found) {
          setCurrentTopic(found);
          const parentSection = courseData.find((s) =>
            s.topics.some((t) => t.id === lastTopicId)
          );
          if (parentSection) {
            setOpenSections((prev) => ({ ...prev, [parentSection.id]: true }));
          }
          return;
        }
      }

      // Fallback: first incomplete topic
      const firstIncomplete = allTopics.find((t) => !completed.has(t.id));
      if (firstIncomplete) setCurrentTopic(firstIncomplete);
    };

    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ────────────────────────────────
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ── Toggle section accordion ────────────────────────────
  const toggleSection = useCallback((sectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="h-screen flex flex-col" style={{ background: '#0F1117' }}>
      {/* ── Top Bar ───────────────────────────────────────── */}
      <div
        className="h-[52px] flex items-center justify-between px-4 border-b border-sidebar-border flex-shrink-0"
        style={{ background: '#0F1117' }}
      >
        {/* Left: Back */}
        <Link
          to="/courses"
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Courses</span>
        </Link>

        {/* Center: Title (desktop) */}
        <h2 className="font-heading font-semibold text-white text-sm hidden md:block truncate max-w-[300px]">
          {currentTopic.title}
        </h2>

        {/* Right: Nav + Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Previous topic"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-gray-500 font-mono min-w-[50px] text-center">
            {currentIdx + 1}/{totalTopics}
          </span>
          <button
            onClick={goNext}
            disabled={currentIdx >= allTopics.length - 1}
            className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Next topic"
          >
            <ChevronRight size={16} />
          </button>
          <div className="w-px h-5 bg-gray-700 mx-1 hidden lg:block" />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-gray-400 hover:text-white hidden lg:block transition-colors"
            title="Toggle sidebar"
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>
          <button
            onClick={() => setMobileDrawer(true)}
            className="p-1.5 text-gray-400 hover:text-white lg:hidden transition-colors"
            title="Open course menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </div>

      {/* ── Main Layout ────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar (Desktop) ──────────────────────────── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="hidden lg:block flex-shrink-0 border-r border-sidebar-border overflow-hidden"
            >
              <CourseSidebar
                courseTitle={courseTitle}
                courseData={courseData}
                currentTopicId={currentTopic.id}
                completedTopics={completedTopics}
                openSections={openSections}
                onToggleSection={toggleSection}
                onSelectTopic={goToTopic}
                totalTopics={totalTopics}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content Area ────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-y-auto dark-scroll">
          {/* Video Player — self-contained, receives currentTopic as prop */}
          <div className="w-full max-w-[1200px] mx-auto px-0 lg:px-4 pt-0 lg:pt-4">
            <VideoPlayer
              currentTopic={currentTopic}
              onTopicComplete={handleTopicComplete}
              onNextTopic={handleNextTopic}
            />
          </div>

          {/* ── Auto-play Next Notification ─────────────── */}
          <AnimatePresence>
            {nextCountdown !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto mt-3 px-5 py-3 rounded-xl flex items-center gap-3 max-w-[600px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))',
                  border: '1px solid rgba(59,130,246,0.3)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#1F2937" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15" fill="none" stroke="#3B82F6" strokeWidth="3"
                      strokeDasharray={`${(nextCountdown / 3) * 94.25} 94.25`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute text-white text-xs font-bold">{nextCountdown}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-xs">Playing next in {nextCountdown}s</p>
                  <p className="text-white text-sm font-semibold truncate flex items-center gap-1.5">
                    <SkipForward size={13} className="text-blue-400 flex-shrink-0" />
                    {nextTopicName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (countdownRef.current) clearInterval(countdownRef.current);
                    setNextCountdown(null);
                    setNextTopicName('');
                  }}
                  className="text-gray-500 hover:text-white transition-colors p-1"
                  title="Cancel auto-play"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Topic Info ─────────────────────────────────── */}
          <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-4 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="font-heading font-bold text-white text-xl">
                  {currentTopic.title}
                </h2>
                <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                  <Clock size={13} />
                  Duration: {formatDuration(currentTopic.start, currentTopic.end)}
                </p>
              </div>
              {/* Mark complete button */}
              {!completedTopics.has(currentTopic.id) ? (
                <button
                  onClick={() => markCompleteInternal(currentTopic.id)}
                  className="self-start sm:self-center px-4 py-2 rounded-lg text-sm font-semibold transition-all
                    bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40"
                >
                  ✓ Mark as Complete
                </button>
              ) : (
                <span className="self-start sm:self-center px-4 py-2 rounded-lg text-sm font-semibold
                  bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5">
                  ✅ Completed
                </span>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={goPrev}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <button
                onClick={goNext}
                disabled={currentIdx >= allTopics.length - 1}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>

            {/* Section info */}
            <div className="border-t border-gray-800 pt-4">
              <p className="text-gray-400 text-sm leading-relaxed">
                Welcome to <strong className="text-gray-200">{currentTopic.title}</strong>.
                This topic is part of the <strong className="text-gray-200">{courseTitle}</strong> course.
                Follow along with the video and practice the concepts covered in this lecture.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ──────────────────────────────────── */}
      <AnimatePresence>
        {mobileDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileDrawer(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50 lg:hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileDrawer(false)}
                className="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
              <CourseSidebar
                courseTitle={courseTitle}
                courseData={courseData}
                currentTopicId={currentTopic.id}
                completedTopics={completedTopics}
                openSections={openSections}
                onToggleSection={toggleSection}
                onSelectTopic={goToTopic}
                totalTopics={totalTopics}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchPage;
