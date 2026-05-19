import { Router } from 'express';
import {
  getCourseProgress,
  updateTopicProgress,
  markLectureCompleted,
  saveResumePosition,
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// ── New: Topic-based progress (YouTube timestamp courses) ──
router.post('/update', protect, updateTopicProgress);

// ── Existing endpoints (backward compatible) ───────────────
router.get('/:courseId', protect, getCourseProgress);
router.patch('/:courseId/lecture/:lectureId', protect, markLectureCompleted);
router.patch('/:courseId/resume', protect, saveResumePosition);

export default router;
