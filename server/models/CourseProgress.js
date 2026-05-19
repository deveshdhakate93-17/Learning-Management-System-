import mongoose from 'mongoose';

/**
 * CourseProgress schema — tracks per-user, per-course progress.
 * Supports both ObjectId-based lecture tracking (for DB courses)
 * and string-based topic tracking (for static courseData like YouTube timestamps).
 */
const courseProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // courseId can be an ObjectId (for DB courses) or a slug string (e.g. "web-development")
  courseId: {
    type: String,
    required: true,
  },
  // Array of completed topic/lecture IDs (stored as strings for flexibility)
  completedTopics: [{
    type: String,
  }],
  // The last topic the user was watching
  lastWatchedTopicId: {
    type: String,
    default: null,
  },
  // Auto-computed progress percentage
  progressPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Unique constraint: one progress doc per user per course
courseProgressSchema.index({ user: 1, courseId: 1 }, { unique: true });

export default mongoose.model('CourseProgress', courseProgressSchema);
