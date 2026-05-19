import { Router } from 'express';
import {
  getEnrolledCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
  enrollInCourse,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Student routes (protected)
router.get('/', protect, getEnrolledCourses);
router.get('/:slug', protect, getCourseBySlug);
router.post('/:id/enroll', protect, enrollInCourse);

// Admin-only routes
router.get('/admin/all', protect, authorize('admin'), getAllCourses);
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

export default router;
