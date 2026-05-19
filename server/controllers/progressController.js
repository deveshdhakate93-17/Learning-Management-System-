import UserProgress from '../models/UserProgress.js';
import CourseProgress from '../models/CourseProgress.js';
import Course from '../models/Course.js';

// ══════════════════════════════════════════════════════════
// EXISTING ENDPOINTS (kept intact for backward compatibility)
// ══════════════════════════════════════════════════════════

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Try the new CourseProgress model first (string-based topic IDs)
    let progress = await CourseProgress.findOne({
      user: req.user._id,
      courseId,
    });

    if (progress) {
      return res.json({
        courseId,
        completedTopics: progress.completedTopics,
        lastWatchedTopicId: progress.lastWatchedTopicId,
        progressPercent: progress.progressPercent,
      });
    }

    // Fallback to legacy UserProgress model (ObjectId-based)
    let legacy = await UserProgress.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (legacy) {
      return res.json({
        courseId,
        completedLectures: legacy.completedLectures,
        lastWatched: legacy.lastWatched,
        progressPercentage: legacy.progressPercentage,
      });
    }

    // No progress found
    res.json({
      courseId,
      completedTopics: [],
      lastWatchedTopicId: null,
      progressPercent: 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ══════════════════════════════════════════════════════════
// NEW: Topic-based progress (for YouTube timestamp courses)
// ══════════════════════════════════════════════════════════

/**
 * POST /api/progress/update
 * Body: { courseId, topicId, lastWatchedTopicId, totalTopics }
 * Marks a topic complete and auto-calculates progress percentage.
 */
export const updateTopicProgress = async (req, res) => {
  try {
    const { courseId, topicId, lastWatchedTopicId, totalTopics } = req.body;

    if (!courseId || !topicId) {
      return res.status(400).json({ message: 'courseId and topicId are required' });
    }

    let progress = await CourseProgress.findOne({
      user: req.user._id,
      courseId,
    });

    if (!progress) {
      progress = new CourseProgress({
        user: req.user._id,
        courseId,
        completedTopics: [],
      });
    }

    // Add topic to completed list (if not already there)
    if (!progress.completedTopics.includes(topicId)) {
      progress.completedTopics.push(topicId);
    }

    // Update last watched
    if (lastWatchedTopicId) {
      progress.lastWatchedTopicId = lastWatchedTopicId;
    }

    // Auto-calculate progress
    const total = totalTopics || 40; // default to 40 topics if not specified
    progress.progressPercent = Math.round(
      (progress.completedTopics.length / total) * 100
    );

    progress.updatedAt = new Date();
    await progress.save();

    res.json({
      courseId,
      completedTopics: progress.completedTopics,
      lastWatchedTopicId: progress.lastWatchedTopicId,
      progressPercent: progress.progressPercent,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ══════════════════════════════════════════════════════════
// LEGACY ENDPOINTS (kept for backward compatibility)
// ══════════════════════════════════════════════════════════

export const markLectureCompleted = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    let progress = await UserProgress.findOne({ user: req.user._id, course: courseId });
    if (!progress) progress = new UserProgress({ user: req.user._id, course: courseId });

    const alreadyCompleted = progress.completedLectures.some(l => l.lecture?.toString() === lectureId);
    if (!alreadyCompleted) progress.completedLectures.push({ lecture: lectureId });

    const course = await Course.findById(courseId);
    if (course) progress.progressPercentage = Math.round((progress.completedLectures.length / course.totalLectures) * 100);
    await progress.save();
    res.json({ courseId, ...progress.toObject() });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const saveResumePosition = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lectureId, timestamp } = req.body;

    // Save to new CourseProgress model if lectureId is a string topic ID
    // (e.g. "t1", "css_t1", "js_t1") — i.e. NOT a MongoDB ObjectId
    const isTopicId = typeof lectureId === 'string' && !/^[0-9a-fA-F]{24}$/.test(lectureId);
    if (isTopicId) {
      let progress = await CourseProgress.findOne({ user: req.user._id, courseId });
      if (!progress) {
        progress = new CourseProgress({ user: req.user._id, courseId, completedTopics: [] });
      }
      progress.lastWatchedTopicId = lectureId;
      progress.updatedAt = new Date();
      await progress.save();
      return res.json({ courseId, lastWatchedTopicId: lectureId });
    }

    // Legacy: ObjectId-based
    let progress = await UserProgress.findOne({ user: req.user._id, course: courseId });
    if (!progress) progress = new UserProgress({ user: req.user._id, course: courseId });
    progress.lastWatched = { lecture: lectureId, timestamp, watchedAt: new Date() };
    await progress.save();
    res.json({ courseId, ...progress.toObject() });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
