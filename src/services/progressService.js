import { api } from './authService';

/**
 * Progress Service — handles course progress tracking.
 * Supports both legacy ObjectId-based and new string-based topic tracking.
 * Works for any course (Web Dev, Python, etc.) — no hardcoded totals.
 */
const progressService = {
  /**
   * Get course progress by courseId (slug or ObjectId).
   * Returns: { completedTopics[], lastWatchedTopicId, progressPercent }
   */
  getCourseProgress: async (courseId) => {
    const { data } = await api.get(`/progress/${courseId}`);
    return data;
  },

  /**
   * Mark a topic/lecture as completed (new topic-based approach).
   * POST /api/progress/update
   * @param {string} courseId — e.g. "web-development" or "python-programming"
   * @param {string} topicId — e.g. "t1" or "py_t1"
   * @param {number} totalTopics — total topics in the course for % calculation
   */
  markLectureCompleted: async (courseId, topicId, totalTopics) => {
    const { data } = await api.post('/progress/update', {
      courseId,
      topicId,
      lastWatchedTopicId: topicId,
      totalTopics: totalTopics || 40,
    });
    return data;
  },

  /**
   * Save resume position (last watched topic).
   * PATCH /api/progress/:courseId/resume
   */
  saveResumePosition: async (courseId, lectureId, timestamp) => {
    const { data } = await api.patch(`/progress/${courseId}/resume`, {
      lectureId,
      timestamp,
    });
    return data;
  },

  /**
   * Legacy: mark lecture completed by ObjectId.
   * PATCH /api/progress/:courseId/lecture/:lectureId
   */
  markLectureCompletedLegacy: async (courseId, lectureId) => {
    const { data } = await api.patch(`/progress/${courseId}/lecture/${lectureId}`);
    return data;
  },
};

export default progressService;
